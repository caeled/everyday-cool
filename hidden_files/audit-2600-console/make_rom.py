#!/usr/bin/env python3
"""Tiny two-pass assembler for the subset of 6502 used by the audit ROM,
plus the TEST2600 synthetic ROM source. Output: exactly 4096 bytes."""
import sys

OPS = {
    # mnemonic: {mode: opcode}
    'SEI': {'imp': 0x78}, 'CLD': {'imp': 0xD8}, 'TXA': {'imp': 0x8A},
    'INX': {'imp': 0xE8}, 'DEX': {'imp': 0xCA},
    'LDA': {'imm': 0xA9, 'zp': 0xA5, 'abs': 0xAD, 'absx': 0xBD},
    'LDX': {'imm': 0xA2, 'zp': 0xA6},
    'STA': {'zp': 0x85, 'zpx': 0x95, 'abs': 0x8D},
    'AND': {'imm': 0x29},
    'CMP': {'imm': 0xC9},
    'INC': {'zp': 0xE6},
    'BEQ': {'rel': 0xF0}, 'BNE': {'rel': 0xD0}, 'BCC': {'rel': 0x90},
    'JMP': {'abs': 0x4C},
}
SIZE = {'imp': 1, 'imm': 2, 'zp': 2, 'zpx': 2, 'rel': 2, 'abs': 3, 'absx': 3}

SRC = """
        .org $F000
RESET:  SEI
        CLD
        LDX #$00
        TXA
CLEAR:  STA $00,X
        INX
        BNE CLEAR
        LDA #$0E
        STA $08          ; COLUPF = near-white
        LDA #$FF
        STA $0E          ; PF1 = all bits on
        LDA #$01
        STA $0A          ; CTRLPF = reflect playfield
FRAME:  LDA #$02
        STA $00          ; VSYNC on
        STA $02          ; WSYNC x3
        STA $02
        STA $02
        LDA #$00
        STA $00          ; VSYNC off
        LDA $0280        ; SWCHA
        STA $82          ; CURR
        AND #$10         ; P0 Up bit (0 = pressed)
        BEQ UPSET
        LDA $82
        AND #$20         ; P0 Down bit (0 = pressed)
        BEQ DOWNOW
        LDA #$00
        STA $81          ; PREV = 0
        JMP SETCOL
DOWNOW: LDA $81
        BNE SETCOL
        LDA #$01
        STA $81          ; PREV = 1
        INC $80          ; MODE++
        LDA $80
        CMP #$03
        BCC SETCOL
        LDA #$00
        STA $80          ; MODE wraps to 0
        JMP SETCOL
UPSET:  LDA #$36
        STA $09          ; COLUBK = orange-red while Up held
        JMP LINES
SETCOL: LDX $80
        LDA COLORS,X
        STA $09          ; COLUBK = mode colour
LINES:  LDX #37
VBL:    STA $02
        DEX
        BNE VBL
        LDA #$00
        STA $01          ; VBLANK off
        LDX #192
VIS:    STA $02
        DEX
        BNE VIS
        LDA #$02
        STA $01          ; VBLANK on
        LDX #30
OVR:    STA $02
        DEX
        BNE OVR
        JMP FRAME
COLORS: .byte $84,$C6,$66
        .org $FFFC
        .word RESET
        .word RESET
"""

def parse(src):
    items = []  # (addr-independent) list of ('label',name) / ('org',val) / ('op',mnem,operand) / ('bytes',list) / ('words',list)
    for raw in src.splitlines():
        line = raw.split(';')[0].strip()
        if not line:
            continue
        label = None
        if ':' in line:
            label, line = line.split(':', 1)
            label = label.strip()
            line = line.strip()
            items.append(('label', label))
            if not line:
                continue
        if line.startswith('.org'):
            items.append(('org', int(line[4:].strip().replace('$', '0x'), 0)))
        elif line.startswith('.byte'):
            vals = [int(v.strip().replace('$', '0x'), 0) for v in line[5:].split(',')]
            items.append(('bytes', vals))
        elif line.startswith('.word'):
            items.append(('words', [v.strip() for v in line[5:].split(',')]))
        else:
            parts = line.split(None, 1)
            mnem = parts[0].upper()
            operand = parts[1].strip() if len(parts) > 1 else None
            items.append(('op', mnem, operand))
    return items

def mode_of(mnem, operand):
    if operand is None:
        return 'imp'
    if operand.startswith('#'):
        return 'imm'
    if operand.endswith(',X') or operand.endswith(',x'):
        base = operand[:-2].strip()
        if base.startswith('$') and len(base) <= 3:
            return 'zpx'
        return 'absx'
    if mnem in ('BEQ', 'BNE', 'BCC'):
        return 'rel'
    if operand.startswith('$') and len(operand) <= 3:
        return 'zp'
    return 'abs'

def val_of(tok, labels):
    tok = tok.strip()
    if tok in labels:
        return labels[tok]
    return int(tok.replace('$', '0x'), 0)

def assemble(src):
    items = parse(src)
    # pass 1: addresses
    labels = {}
    pc = 0
    placed = []
    for it in items:
        if it[0] == 'label':
            labels[it[1]] = pc
        elif it[0] == 'org':
            pc = it[1]
        elif it[0] == 'bytes':
            placed.append((pc, it)); pc += len(it[1])
        elif it[0] == 'words':
            placed.append((pc, it)); pc += 2 * len(it[1])
        elif it[0] == 'op':
            mode = mode_of(it[1], it[2])
            placed.append((pc, ('op', it[1], it[2], mode))); pc += SIZE[mode]
    # pass 2: emit
    rom = bytearray(4096)
    for addr, it in placed:
        off = addr - 0xF000
        if it[0] == 'bytes':
            for i, v in enumerate(it[1]):
                rom[off + i] = v & 0xFF
        elif it[0] == 'words':
            for i, tok in enumerate(it[1]):
                v = val_of(tok, labels)
                rom[off + 2 * i] = v & 0xFF
                rom[off + 2 * i + 1] = (v >> 8) & 0xFF
        else:
            _, mnem, operand, mode = it
            rom[off] = OPS[mnem][mode]
            if mode == 'imp':
                pass
            elif mode == 'imm':
                rom[off + 1] = int(operand[1:].replace('$', '0x'), 0) & 0xFF
            elif mode in ('zp', 'zpx'):
                rom[off + 1] = val_of(operand.replace(',X', '').replace(',x', ''), labels) & 0xFF
            elif mode in ('abs', 'absx'):
                v = val_of(operand.replace(',X', '').replace(',x', ''), labels)
                rom[off + 1] = v & 0xFF
                rom[off + 2] = (v >> 8) & 0xFF
            elif mode == 'rel':
                target = val_of(operand, labels)
                rel = target - (addr + 2)
                assert -128 <= rel <= 127, f"branch out of range at {addr:04X}"
                rom[off + 1] = rel & 0xFF
    return bytes(rom), labels

rom, labels = assemble(SRC)
assert len(rom) == 4096
assert rom[0xFFC] == labels['RESET'] & 0xFF and rom[0xFFD] == (labels['RESET'] >> 8) & 0xFF
with open('/tmp/audit2600/test2600.bin', 'wb') as f:
    f.write(rom)
print("labels:", {k: hex(v) for k, v in labels.items()})
print("first 32 bytes:", rom[:32].hex(' '))
print("reset vector:", hex(rom[0xFFC] | (rom[0xFFD] << 8)))
print("wrote /tmp/audit2600/test2600.bin (4096 bytes)")

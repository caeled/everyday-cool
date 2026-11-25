# Audit — CS Wave: Pipelined CPU Sim & Raft Consensus Sim (Antigravity-built)

Auditor: Muse (integration audit for Everyday Cool). Date: 2026-11-24.
Files audited (unmodified, as shipped in `~/workspace/user/files/`):
- `pipelined-cpu-sim.html` — "Pipeline — 5-Stage RISC CPU, Assembly & Cache/Hazard Simulator"
- `raft-consensus-sim.html` — "Consensus — Distributed Raft Protocol, Leader Election & Partitions"

Method: the CPU's fenced sim core (`// === SIM CORE START/END ===`) was extracted verbatim and
run in Node against independently hand-derived pipeline schedules. The Raft script was loaded
in jsdom with an export hook appended (shipped code untouched), a seeded RNG, and `stepSim`
driven manually; two monitors sampled every step: (a) committed-prefix consistency across all
nodes, (b) leaders-per-term. Both pages were also driven through their real DOM UI (preset
buttons, toggles, sliders, transport buttons, assembler) in jsdom. Verdicts: PASS = claim
reproduces exactly; BENDS = works but deviates/simplifies in a way a learner should know;
FALSE = claim or protocol rule is wrong as shipped.

---

## 1. pipelined-cpu-sim.html

### 1.1 Claims inventory
6 presets with commented expected values (RAW chain results, Fibonacci sequence, load-use
results 20/40/300, cache thrash narration, countdown sum 21 → 121, array sum 360); telemetry
Cycle / Retired / CPI / IPC / Stall Cycles / Branch Flushes / L1 hit rate; hardware claims:
EX→EX & MEM→EX forwarding, "load-use needs 1 bubble even with forwarding", 2-bit branch
predictor + BTB ("OFF = always not-taken"), L1 "4 sets × 2 words (8B line)", miss-penalty
slider 1–5 cycles, R0 = 0, ISA list (ADD SUB MUL AND OR XOR SLT, ADDI LI, LW SW, BEQ BNE BLT J,
NOP HALT, R0–R7).

### 1.2 Hand-trace verification (independent schedules vs sim core) — PASS
All 33 core checks passed except 3 cycle totals on the load-use program, which investigation
showed were **my** trace's error, not the sim's (see 1.4):

| Program (config) | Hand-derived | Sim measured |
|---|---|---|
| 3 independent ADDI + HALT | retire c5/6/7, halt c7, CPI 7/3 | 7 cycles, CPI 2.3333 |
| RAW chain (FWD on) | 7 cycles, 0 stalls, R3=20 | 7, 0, 20 |
| RAW chain (FWD off) | 11 cycles, 4 RAW stalls | 11, 4 |
| RAW preset (FWD on) | 12 cycles, regs 19/7/133/130/142/100 | 12, exact (EX fwd 6, MEM fwd 2) |
| RAW preset (FWD off) | 24 cycles, 12 RAW stalls, CPI 3.00 | 24, 12 |
| Branch preset (BP off) | retired 21, 5 mispredicts, 10 flush slots, 35 cycles | 21, 5, 10, 35; R2=21, R3=121 |
| Branch preset (BP on) | 2 mispredicts (cold BTB + loop exit), 4 flushes, 29 cycles | 2, 4, 29 |
| Load-use (penalty 2) | LU stall 1, 1 miss, 2 miss-stall cycles, 3 stall cycles total | all exact; total 10 cycles* |
| Load-use (penalty 5) | miss-stall cycles = 5 | 5; total 13 cycles* |
| Fibonacci preset | R2=R6=55, RAM[0..9]=1,1,2,3,5,8,13,21,34,55, retired 69 | exact; cache 5 hits/5 misses |
| Load-use preset | R3=20, R5=40, R7=300, RAM[3]=300, 3 LU stalls, 2H/2M (50%) | exact |
| Cache preset | 6 misses / 4 hits / 40% (set-0 thrash, spatial hits) | exact; R2=10, R3=90, R4=30, R7=60 |
| Array-sum preset | R3=360, RAM[8]=360, 8 LU stalls | exact; 5 misses / 4 hits, retired 44 |

Every value printed in the preset comments is correct. The cache geometry in code
(set = (wordAddr>>1)&3, tag = wordAddr>>3, 2-word lines) matches the "4 sets × 2 words (8B)"
label, and the thrash pattern the comments narrate (addr 0 vs 32 evicting in set 0) is what
the counters actually record. CPI/IPC telemetry is cycles/retired — verified in the live UI
(branch preset halted at cycle 35, retired 21 → display "1.67 / 0.60").

Also verified: R0 is hardwired (writes to R0 discarded, reads return 0); store-data (SW rs2)
hazards stall/forward correctly both ways; a program with no HALT drains and halts; the
assembler rejects unknown opcodes, bad registers, and wrong operand counts with line-numbered
errors that surface in the UI; the Gantt trace is internally consistent (WB cells == retired,
per-instruction stage order monotonic).

### 1.3 UI drive — PASS (16/16)
Step button advances exactly 1 cycle per click; Reset re-assembles; preset buttons load code;
the Forwarding toggle through the real UI reproduces the 12 → 24 cycle change on the RAW
preset (stalls 0 → 12); Assemble & Run executes custom code and the register table shows the
result (R2=6 for a doubling program); tabs, drawer collapse, Cinema mode, speed buttons,
miss-penalty and clock sliders (labels update), and the sound toggle (no crash without an
AudioContext) all work. No dead controls found. No window errors.

### 1.4 BENDS
1. **My trace vs the sim (resolved in the sim's favour):** on the cycle a cache fill
   completes, the instruction held in ID decodes in that same cycle (the Gantt shows LW in MEM
   at c5–c7 with ADD decoding at c7). That is correct latch semantics — simultaneous
   MEM→WB and ID→EX movement — and the same convention reproduces the branch-flush totals
   exactly. Noted because the load-use program's total (10 cycles at penalty 2, not 11) is
   the kind of number a hand-tracer will initially dispute.
2. **Cache OFF still counts "misses":** with the cache disabled, every access increments the
   L1 Misses counter and the hit-rate readout shows 0% rather than "bypassed". The timing
   behaviour matches the label ("OFF forces RAM stalls", full miss penalty charged), but the
   counters present a disabled cache as a 0%-hit cache.
3. **"Branch Flushes" counts slots, not events:** each misprediction adds the number of
   in-flight slots flushed (2 in these pipelines: the ID occupant plus the speculative fetch
   slot — a fetched HALT marker can be one of them), with a floor of 1. The same branch run
   therefore reads "Branch Flushes 10" in telemetry and "Mispredicts 5" in the Hardware tab.
   Both numbers are defensible; the page never says they measure different things.
4. **Predictor warm-up is BTB-gated:** a branch is only predicted taken once its BTB entry
   exists *and* the 2-bit state is ≥ weakly-taken, so the first taken branch always
   mispredicts and jumps (J) are predicted not-taken until first executed (measured J-loop,
   BP on: 2 mispredicts / 5 control transfers). True to the implemented design, but the
   "Predicts taken loops" label glosses over the cold-start cost.
5. **CPI includes fill/drain:** CPI = total cycles / retired, so a hazard-free 3-instruction
   program shows CPI 2.33. Standard for this definition; short programs look artificially bad.
6. **Unlabelled simplifications:** MUL completes in one EX cycle (no multi-cycle multiply);
   RAM is 64 words with silent address wrap (`wordAddr & 63` — byte addr 256 aliases word 0)
   while the UI displays only words 0–17.

### 1.5 FALSE
None found. Every quantitative claim on the page that was tested reproduced exactly.

---

## 2. raft-consensus-sim.html

### 2.1 Claims inventory
"Raft Protocol" with quorum 3/5 and 4/7; presets: Healthy 5-Node, Leader Crash ("watch
re-election"), Split-Brain 3v2 ("minority divergence & rollback"), Flaky Network ("25% packet
loss & retries"), 7-Node HA ("tolerates up to 3 simultaneous server crashes"), Split-Vote Tie
("randomized backoff breaks the tie in Term T3"); minority-write button labelled
"Uncommittable"; committed state-machine (KV) panel "guaranteed identical prefix by Raft Log
Matching"; safety badge states (Consensus Healthy / Electing / Partitioned (Majority OK) /
No Quorum!); timing sliders (packet loss 0–60%, latency, election-timeout base, heartbeat).

### 2.2 What is genuinely Raft — PASS
- **Quorum math:** floor(n/2)+1 — 3/5 and 4/7 shown correctly (live UI confirmed "4 / 7").
  Measured: 7-node cluster commits with 3 nodes dead (4/7 alive) and cannot commit with 4
  dead (leader commitIndex frozen).
- **Vote restriction (§5.4.1):** RequestVote is granted only if the candidate's log is at
  least as up-to-date (lastLogTerm, then lastLogIndex). Unit-driven: a candidate with
  (lastTerm 1, lastIndex 1) was denied by a voter holding 2 entries; the same voter granted
  an up-to-date candidate; a second candidate in the same term was then denied (one vote
  per term at the handler level).
- **Commit rule (§5.4.2) — the subtle one, implemented correctly:** a leader commits by
  counting replicas only entries from its own term. Measured end-to-end: leader S1 appended
  "SET x=42" (term 1) and was killed mid-replication; the entry reached all followers, the
  new T2 leader held it in every log — and commitIndex stayed 1 on all five nodes until a
  term-2 write arrived, whereupon both entries committed together (commitIndex 3). This is
  exactly the paper's Figure-8 rule, and the sim gets it right.
- **Leader Completeness:** with a committed entry on S1–S3 only, stale-log candidate S4
  collected only {S4, S5} and never led; complete candidate S2 won the next term holding
  the committed entry.
- **Split-brain preset, as billed:** minority leader S1 keeps "SET stale=99" uncommitted
  forever (commitIndex stays 1); majority elects S3@T2 and commits; on Heal, S1 steps down,
  the stale entry is truncated and overwritten (rollback path exercised), all five logs
  converge to identical contents, and the committed prefix never diverged at any sampled step.
- **Leader crash:** button and preset both produce re-election (S2@T2). **Split-vote
  preset:** the engineered 2–2 tie resolves to a single leader (S1@T3), as its banner says.
- **Organic election:** from a cold, leaderless start a single leader emerged in ≈6.8 s of
  sim time (seeded run); no term ever had two leaders in that run.
- **Chaos fuzz:** 120 s at 25% packet loss with auto-writes, random kill/revive every ~10 s
  and a partition/heal cycle — committed-prefix safety was never violated and no term had
  two leaders organically.
- **HUD honesty:** the safety badge's four states are all reachable and correctly
  conditioned; "Committed Idx" is the max commitIndex; quorum bar reflects the largest
  alive partition group. All driven UI controls (write, kill leader, split/heal on both
  tabs, presets, node-count switch, all four sliders, pause, reset, auto-write) work.

### 2.3 FALSE — Election Safety is violable (vote erased by same-term step-down)
`stepDown()` unconditionally sets `votedFor = null`. `handleAppendEntries` calls
`stepDown(node, pkt.term)` whenever the receiver is not a follower — including a **candidate
whose term equals the packet's term**. Raft's rule is that a vote cast in a term persists
for that term; stepping down from candidate to follower *within the same term* must not
erase it.

Deterministic repro driving the page's own handlers (5 nodes, term 2): S1 is the
legitimately elected T2 leader (votes {S1,S4,S5}); S2 is a T2 candidate that voted for
itself; S3 is a rival T2 candidate.
1. Control: S3's RequestVote to S2 is **denied** (S2's vote stands) — correct.
2. S1's same-term AppendEntries heartbeat reaches candidate S2 → S2 steps down and its
   `votedFor` becomes **null** (a plain follower receiving the same packet keeps its vote —
   the step-down path is only taken by candidates/leaders).
3. S3 re-asks S2 and is **granted**; with one further fresh vote (S5, modelled as a node
   that had not voted in T2) S3 reaches quorum {S3, S2, S5} and becomes leader.
Result measured: **two leaders coexist in term 2 — S1 and S3.** Election Safety
(at most one leader per term) is violated.

Severity, stated plainly: in organic play the interleave is tight — the rival must solicit
the stepped-down candidate after the heartbeat lands but before the term advances — and it
did **not** occur in the 120 s fuzz run or any other organic scenario. But the rule breach
is in the shipped code path and is provable through the page's own RPC handlers, so the
page's implicit "this is Raft, and Raft is safe" claim does not hold without qualification.
Fix direction (not applied — audit only): only clear `votedFor` when the term actually
increases.

### 2.4 BENDS / simplifications (with evidence)
1. **Pre-seeded leadership:** the Healthy/Leader-Crash/Split-Brain/Flaky/7-Node presets
   install S1 as leader of T1 with every node's `votedFor` pre-set — no boot election ever
   happens. Only the Split-Vote preset and post-crash re-elections exercise the election path.
2. **No persistence model:** killing a node flips `alive` but keeps its log, term and
   `votedFor` in memory; a restarted node returns with everything intact — effectively
   perfect stable storage, with the crash itself costing nothing but time. Relatedly,
   **in-flight packets from a node killed mid-flight are still delivered** (measured in the
   mid-replication kill: followers replicated the dead leader's AppendEntries) — real
   networks do deliver some in-flight messages, but the sim never drops a packet merely
   because its sender died.
3. **No Pre-Vote — disruptive-server behaviour included:** a lone minority node keeps
   incrementing its term (measured: S2 reached T5 while isolated), and on heal its inflated
   term forces the healthy cluster into a fresh higher-term election (post-heal leader was
   T7, displacing a working T2 leader). Faithful to Raft-without-Pre-Vote, but the page
   never names it.
4. **Isolated leader never abdicates:** a minority leader stays leader indefinitely (no
   lease / quorum-contact check). The UI is honest about the consequence ("Uncommittable"),
   and the entry correctly never commits.
5. **Client writes to a non-leader are dropped, not redirected:** the delivery handler
   floats "REDIRECT (NOT LEADER)" and discards the write. The UI normally targets the
   majority leader, so this is a corner path (reachable via the client emitter during
   elections/leader changes).
6. **Follower commit rule approximation:** `commitIndex = min(leaderCommit, log.length)`
   instead of the paper's "min(leaderCommit, index of last new entry)" — equivalent here
   because logs are contiguous, but it is not the paper's formula.
7. **Heartbeat acks suppressed:** followers ack AppendEntries only when entries were
   carried or a rollback happened (`needAck` gate), so a leader's matchIndex for idle
   followers can lag until the next real append. Harmless to safety; not paper-faithful.
8. **Network model:** packet loss is decided at send time (a `dropAt` fraction along the
   flight) rather than per link at delivery; one global latency (labelled, default 0.85 s)
   with ±12% jitter serves all links; election timeouts are base + up to 72% random spread.
9. **Fixed membership, no snapshots:** 5 or 7 nodes only, no joint consensus / membership
   change, no log compaction, no learner/read protocols — expected teaching simplifications,
   none of them labelled on the page.
10. **Telemetry "Current Term"** is the maximum term across nodes, so during a partition it
    displays the isolated minority's inflated term rather than the majority's working term.

---

## 3. Bottom line
- **CPU sim: PASS-grade.** Its presets' printed numbers, cycle counts, stall/flush/cache
  counters and predictor behaviour all reproduce against independent hand-derived schedules,
  in several cases to the exact cycle. The bends are labelling/presentation issues
  (flush-slot counting, cache-off counters, cold-start predictor), not wrong physics.
- **Raft sim: strong core, one real safety hole.** The hard parts of Raft — vote
  restriction, the §5.4.2 commit rule, leader completeness, minority rollback — are
  genuinely implemented and were measured working under kills, partitions and 25% loss.
  But Election Safety is not absolute as shipped: a candidate that steps down on a
  same-term AppendEntries has its vote erased and can re-vote in the same term, which a
  driven handler-level sequence turns into two leaders in one term (S1 and S3 in T2).
  Organically rare (absent from 120 s of fuzz), provable on demand.

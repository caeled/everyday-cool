# The Robot Room

A free robotics room by Steven Powell, Everyday Cool, built with AI assistance. Nine workshops on how a robot senses, decides, and moves — each one interactive, each one audited, and each one carrying a lesson that shows its work.

Open `index.html`. Everything is local: no framework, account, installation, analytics, or internet connection. The room also works as a standalone folder (download `robot-room.zip` from the collection's downloads).

## The nine workshops

1. **Everyday Motors** (`everyday-motors.html`) — one brushed DC motor on a bench: torque–speed curves, back-EMF, efficiency. By Qwen (Kimi); its constants were rebuilt from a real Mabuchi RF-370CA datasheet in a sanctioned repair after the as-shipped dials implied 428% efficiency.
2. **Everyday Sensors** (`everyday-sensors.html`) — a rover arena: sonar, lidar, an IR array, encoders, an IMU, and Kalman fusion. By Google Antigravity; its heading fusion was repaired under sanction to consume its own compass instead of ground truth.
3. **Everyday Control** (`everyday-control.html`) — a line-following robot and the PID loop that steers it, with bang-bang control first. Qwen's design and copy, completed by Muse after the delivery arrived with no simulation; her presets were measured and two were re-tuned so their labels tell the truth.
4. **Everyday Kinematics** (`everyday-kinematics.html`) — a two-link arm: exact forward/inverse kinematics, a drawn workspace, and unreachable targets that clamp to the rim with the shortfall printed. By Muse.
5. **Everyday Vision** (`everyday-vision.html`) — a real camera pipeline (grayscale, threshold, connected components, centroid steering) over a synthetic feed, including the honest demo of colour tracking collapsing in shadow. By Muse.
6. **Everyday Embedded C** (`everyday-embedded-c.html`) — blink → delay-loop waste → hardware timer/PWM on a simplified ATmega328P register model; every frequency is computed from the registers by datasheet formulas. By Muse.
7. **Everyday Python Robotics** (`everyday-python-robotics.html`) — a small, real interpreter for a beginner subset of Python (stated plainly: not CPython) driving a differential-drive robot through three missions. By Muse.
8. **Everyday ROS 2** (`everyday-ros2.html`) — a discrete publish/subscribe model on a fixed clock: topics, a service, teleop override, and QoS with seeded, reproducible drops. By Muse.
9. **Everyday Simulation** (`everyday-simulation.html`) — a maze world with raycast sensors, circle-vs-grid collision, and an odometry-vs-truth drift bench; its wall-follower solves two mazes and honestly fails the third. By Muse.

Every workshop has a companion lesson (`everyday-*-lesson.html`): the teaching arc, the formulas in plain language, the measured proof table, the references, and the honest box naming what bends.

## Where it came from

The room grew out of **Java Young Robot Builders** (the collection's Java course room — "the code before the wheels") and out of Steven's audition of the Qwen AI Studio agent team on "Expanded Robotics Resources" (24 November 2026). Qwen proposed the nine-workshop bundle; the delivery record — one repair, one completion, one reassignment to Antigravity, six Muse builds — is written in full in `COLLECTION.md` and in each lesson's provenance section.

## Files

- `index.html` — the room's front page (the nine cards, the Java and Satellite Watch doors, Help)
- `everyday-motors.html` / `everyday-motors-lesson.html`
- `everyday-sensors.html` / `everyday-sensors-lesson.html`
- `everyday-control.html` / `everyday-control-lesson.html`
- `everyday-kinematics.html` / `everyday-kinematics-lesson.html`
- `everyday-vision.html` / `everyday-vision-lesson.html`
- `everyday-embedded-c.html` / `everyday-embedded-c-lesson.html`
- `everyday-python-robotics.html` / `everyday-python-robotics-lesson.html`
- `everyday-ros2.html` / `everyday-ros2-lesson.html`
- `everyday-simulation.html` / `everyday-simulation-lesson.html`
- `robot-room-banner.png` — the collection's robot art, reused from the collection hub
- `README.md`, `COLLECTION.md`, `LICENSE`, `LICENSE-CONTENT.md`

Code is MIT; lessons and original content are CC BY 4.0 (see the license files). Guest-built workshops retain their provenance statements in their lessons.

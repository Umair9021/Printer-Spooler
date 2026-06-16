Project: Smart Printer Spooler System — Hybrid Web App

Style: Minimal, professional, black & white only, developer-tool aesthetic

Font: Monospace for labels/logs, clean sans-serif for headings

Mode: Dark mode default, light mode toggle available

Inspiration: animejs.com scroll storytelling + linear.app dashboard cleanliness

Page 1 — Landing Page (Scroll Storytelling)
Design a full-page vertical scroll experience with the following sections. Each section fills 100vh. Minimal text, maximum visual storytelling. No color — only black, white, and grays.
Section 1 — Hero

Dark background. Center-aligned. Large monospace heading: "Smart Printer Spooler" with a subtle animated underline. Below it a small gray subtitle: "Queue · Schedule · Print". A minimal line-art printer icon centered below. Bottom of section has a soft downward scroll indicator arrow that bobs up and down. Very minimal. Lots of breathing room.
Section 2 — The Problem

White background. Show 3 user cards labeled "Alice", "Bob", "Carlos" each with a small document icon. All 3 are pointing arrows toward a single printer icon in the center. The arrows overlap and create visual chaos — crossed lines, collision effect. Small label at bottom center in gray: "Multiple users. One printer. No order." Pure visual, no paragraphs.
Section 3 — The Solution

Dark background. Same 3 user cards on the left. Now a clean vertical queue column appears in the center between users and printer. Jobs flow left to right in an orderly single-file line into the queue. The queue shows 3 stacked job cards with small priority badges (High / Medium / Low) in gray tones. Arrow flows cleanly from queue to printer on the right. Label: "The spooler takes control."
Section 4 — How Scheduling Works

White background. Show the same queue of 3 jobs. Three tabs at the top: "Priority" "FCFS" "SJF" — one is selected (underlined). As the tab changes, jobs visually reorder themselves with smooth animation. Each job card shows: document name, user, priority, pages. Small label: "You choose the order."
Section 5 — Worker Threads

Dark background. Three large minimal cards side by side labeled "Thread 1" "Thread 2" "Thread 3". Each card has a CPU icon at top. On scroll, each card lights up one by one (border turns white, background shifts slightly lighter dark). A small progress bar fills inside each active card. Below each active card shows the job name it is printing. Label: "Three threads. Parallel printing."
Section 6 — OS Concepts

White background. 6 concept badges appear one by one staggered on scroll like floating chips: "Processes" "IPC Pipes" "Threads" "Mutex" "Scheduling" "Banker's Algorithm". Each badge is outlined, monospace text, minimal. Below each badge a one-line gray description appears. Layout is scattered/organic not grid. Label at top: "Built on real OS concepts."
Section 7 — CTA

Dark background. Centered. Large heading: "See it live." Subtitle in gray: "Submit jobs. Watch threads. Feel the OS." One large outlined button: "Launch Dashboard →" with a subtle pulse animation on the border. Below the button in very small gray text: "Built for CUST OS Lab · Semester IV"

Page 2 — Dashboard
Design a single-page dashboard. Dark mode default. Black background, white text, gray borders. No color anywhere except status indicators which use white/gray contrast only.
Layout — CSS Grid
[ Header — full width                        ]
[ User Panel ]  [ Queue Panel — wider        ]
[ Worker Threads Panel — full width          ]
[ Controls   ]  [ Log Panel — wider          ]
[ Status Bar — full width                    ]
Header

Left: monospace logo text "spooler.sys" with a blinking cursor. Center: page title "Dashboard". Right: connection status dot + label ("Connected" / "Disconnected") + dark/light mode toggle switch.
User Panel

Title: "User Processes". List of user rows. Each row: small circle avatar with initials, user name, PID number in gray monospace. Subtle left border on hover. "Submit Job" button at bottom — outlined, full width.
Queue Panel

Title: "Print Queue" + job count badge. List of job cards. Each card: position number, document name, user name small below, priority badge right-aligned (High/Medium/Low in different gray weights), page count. Cards have a very subtle left accent border. Smooth enter/exit animation on each card. Empty state: centered gray text "Queue empty" with a minimal printer icon.
Worker Threads Panel

Three equal cards in a row. Each card: thread number at top small gray, CPU icon center large, status text below (idle / printing), job name when active small gray, progress bar at bottom that fills while printing. Idle cards: dark fill, dimmed. Active cards: slightly lighter background, white border, pulsing border animation.
Controls Panel

Title: "Controls". Scheduling policy dropdown (Priority / FCFS / SJF) with label above. Submit Job button. Reset button. Each button outlined minimal style with hover lift effect.
Submit Job Modal

Opens on button click. Dark overlay. Centered card. Fields: User Name (dropdown), Document Name (text input), Priority (dropdown: High/Medium/Low), Pages (number input). Two buttons: Cancel (ghost) and Submit (outlined). Smooth scale-in animation on open.
Log Panel

Title: "System Log". Monospace font small. Auto scroll. Each line: timestamp in gray + message in white. Lines slide up from bottom on entry. Max visible 8 lines, rest scrollable.
Status Bar

Full width bottom bar. 4 metrics equally spaced: "Jobs Submitted", "Jobs Printed", "Active Threads", "Uptime". Each metric: large number on top, small gray label below.

Design Tokens
Background dark:   #0a0a0a
Background light:  #ffffff
Surface dark:      #111111
Surface light:     #f5f5f5
Border dark:       #222222
Border light:      #e0e0e0
Text primary dark: #ffffff
Text primary light:#0a0a0a
Text muted dark:   #666666
Text muted light:  #999999
Font mono:         JetBrains Mono
Font sans:         Inter
Border radius:     6px

Animation Notes for Figma AI

All scroll sections use entrance animations (fade + translate Y)
Job cards use layout animations (reorder with spring physics)
Worker thread pulse = border opacity 0.4 → 1 loop
Log lines = slide up + fade in
Modal = scale 0.95 → 1 + fade
Button hover = translateY -2px
All transitions: duration 200–400ms, ease-in-out
No bouncy or playful animations — everything subtle and professional
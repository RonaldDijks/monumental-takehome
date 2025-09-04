# Masonry wall builder

This is my solution for Monumental’s take-home assignment about simulating and optimizing a masonry wall build plan.

## Parts completed

- [x] Visualisation
- [x] Interactive building
- [x] Optimized build order
- [x] Stride coloring
- [x] Stretcher bond
- [x] Flemish bond
- [x] English bond
- [x] Wild bond (partial)

## How to run

The easiest way is to visit [this deployment](https://monumental-takehome.vercel.app/).

Alternatively, you can run it locally:

1. Install [bun](https://bun.sh) (or use npm/yarn/pnpm)
2. Clone this repository
3. Run `bun install` to install dependencies
4. Run `bun dev` to start the development server
5. Open http://localhost:5173 in your browser

## Design choices

### Planning

#### Naive

I started out with the naive way of laying the wall brick by brick, from left to right, bottom to top. This was just a way to get something on paper.

#### Sweep

This was the first optimisation that I did. It uses a (also pretty naive) search. It starts in the bottom left position, and then builds strides by sweeping the build window untill it reaches the far end. When it reaches the end of the wall, it switches direction and goes back. It does this untill the entire wall is filled. It doesn't do a great job, but is a good baseline.

After this I started thinking about a better technique to find a more optimal solution. First I thought about approaching the problem as a graph traversal problem, and using an algorithm like A\* to solve it. Because of the size of the problem space this is not feasible, so I simplified.

#### Greedy lookahead

This is a cost based heuristic search through the problem space. It uses three main components to score next moves:

- The amount of bricks it can lay in the current position.
- The amount of bricks it can lay in the next position (weighted).
- The distance it needs to travel to get to the next position (weighted).

My idea was that while it is important to lay as many bricks as possible in the current position, it is even more important to set up a position so that the most amount of bricks can be laid in the next position as well. This outperforms the sweep algorithm by a good margin (and the strides also look a lot more appealing :) ).

### Layouts

#### Basic layouts

The stretcher, English cross bond and Flemish layouts are generated with simple, deterministic rules (no search):

- **Stretcher (running bond)**: courses use full bricks; every other course starts with a half brick to stagger head joints. Any leftover width at the end of a course is closed with a trimmed brick.
- **English cross bond**: courses alternate between stretchers (full bricks) and headers (half‑brick units). Header courses start with a quarter‑brick starter so joints land centered over the stretchers below; the course is closed with a trimmed brick if needed.
- **Flemish bond**: within each course, bricks alternate full and half. Odd courses begin with a quarter‑brick starter to keep joints centered between those above and below; the course is closed with a trimmed brick if needed.

#### Wild bond

The wild bond generates a natural, random-looking pattern while enforcing a set of masonry rules. It uses only full and half bricks, alternating the course starter to maintain stagger and avoid weak vertical lines.

- **Goals/rules enforced**

  - **No vertical head joints aligned** between adjacent courses.
  - **Alternating starters**: even courses start with a half brick; odd courses start with a three‑quarter brick.
  - **No more than 1 consecutive half brick** within a course (edges can use a half to close).
  - **No more than 5 consecutive full bricks** within a course.
  - **Avoid long “staggered steps” (falling teeth)** patterns across courses. The implementation currently guards against long runs; see limitation below.
  - **No quarter bricks** are used.

- **How it’s built**

  - The wall is generated course‑by‑course using randomized backtracking.
  - For each course, candidate bricks are tried in random order (half/full; three‑quarter only when needed to close the course exactly) with head‑joint spacing accounted for.
  - A course finalizes only if all rules pass; otherwise it backtracks. If a full wall attempt fails, generation is retried up to a fixed cap.

- **Status and limitations**
  - Marked as partial: the current guard against long falling‑teeth sequences is conservative to keep generation fast. Tightening this further (e.g., forbidding shorter runs) is possible but made generation too slow in practice.

## Usage guide

### Show full wall design

- **Open** the app and pick a **Layout** from the dropdown (e.g., `stretcher`, `flemishBond`, `englishCrossBond`, `wildBond`).
- **Click** `>>` to lay all bricks at once and see the final wall.

### Step through brick placement interactively

- **Buttons**: use `<` and `>` to go backward/forward one brick; `>>` jumps to the end.
- **Keyboard**: `Space` / `Enter` / `ArrowRight` = next, `ArrowLeft` = previous.

### Switch between naïve vs. optimized algorithms

- Use the **Strategy** dropdown:
  - **naive**: simple baseline order.
  - **sweep**: heuristic improvement.
  - **greedyLookahead**: default, most optimized.
- Changing strategy resets the sequence so you can compare step-by-step.

### Show strides (color‑coded)

- As bricks are laid, they’re **colored by stride**; unlaid bricks remain grey.
- **Total Strides** is displayed in the controls.

### Limitations & Possible Extensions

I wasn't able to fully complete the wild bond exercise. If I had more time, I would try to improve the backtracking to separate the local and global constraints and regenerate only parts of the bond that violate the constraints.
If run time was no constraint (and I wasn't doing this in TS), I would go the direction of using a full SAT solver.

## Closing note

Thank you to the Monumental team for this engaging take-home assignment. I enjoyed exploring the algorithmic challenges of masonry walls a lot! Thanks for reviewing, and hope to speak to you soon! :)

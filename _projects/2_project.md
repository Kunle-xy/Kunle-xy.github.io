---
layout: page
title: Monte Carlo Tree Search - Checkers AI
description: Intelligent game-playing through adaptive simulation
img: assets/img/project_2_cover_photo.JPG
importance: 2
category: ai
github: https://github.com/Kunle-xy/OguntoyeProjects/tree/main/Monte_Carlo%20Tree%20search/Kunle_Oguntoye_proj2
---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/CHECKERS2.png" title="Monte Carlo Tree Search Checkers Game" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Interactive Checkers game powered by Monte Carlo Tree Search AI with adjustable difficulty levels.
</div>

## Why Traditional Search Algorithms Fall Short

When building AI for games like Checkers, the traditional approach uses **Minimax**—an algorithm that exhaustively searches the game tree to find optimal moves. In theory, it sounds perfect: explore every possible move sequence and choose the path that guarantees the best outcome. In practice? It hits a computational wall.

The problem is **combinatorial explosion**. With an average branching factor of 10 moves per turn in Checkers, searching just 8 moves deep requires evaluating 100 million positions. Search 12 moves deep? That's 1 trillion positions—computationally impossible for real-time gameplay.

Even with Alpha-Beta pruning cutting the search space in half, Minimax faces fundamental limitations:

1. **Fixed Depth Horizon** - Critical tactics often occur beyond the search depth cutoff
2. **Heuristic Dependency** - Requires hand-crafted evaluation functions that may misvalue positions
3. **Perfect Play Assumption** - Assumes opponents never make mistakes, missing opportunities to set traps or create complexity
4. **Exponential Scaling** - Doubling the search depth squares the computational cost

---

## Enter Monte Carlo Tree Search

Monte Carlo Tree Search (MCTS) takes a radically different approach: instead of trying to exhaustively search everything, it **learns by experience**. MCTS runs thousands of random game simulations, building statistics about which moves lead to victories. The more simulations it runs, the more confident it becomes about good moves.

### The Four Pillars of MCTS

**1. Selection** - Navigate the tree using the **Upper Confidence Bound for Trees (UCT)** formula, balancing exploitation of known good moves with exploration of untried options:

$$\text{UCT}(v) = \frac{Q(v)}{N(v)} + c \sqrt{\frac{\ln N(\text{parent})}{N(v)}}$$

**2. Expansion** - Add one new unexplored move to the tree, focusing computational resources on promising branches

**3. Simulation** - Play a complete random game from the new position to estimate its value

**4. Backpropagation** - Update win/loss statistics for all moves on the path from root to leaf

This iterative process naturally discovers strong strategies without needing expert knowledge or evaluation functions.

---

## Why MCTS Works

**No Heuristics Required** - Game outcomes speak for themselves. Good positions naturally win more simulations than bad ones, even with random play.

**Adaptive Depth** - MCTS automatically searches deeper in critical positions and shallower in routine ones, using computational resources efficiently.

**Anytime Algorithm** - You can stop after any number of iterations and get a reasonable answer. Need a fast move? Run 50 simulations. Want stronger play? Run 500.

**Handles Complexity** - High branching factors don't cripple MCTS the way they do Minimax. The algorithm simply focuses on promising branches and ignores clearly bad moves.

**Mathematical Guarantee** - By the Law of Large Numbers, as simulations increase, MCTS converges to optimal play.

---

## Implementation Features

This Java implementation showcases MCTS applied to Checkers with:

- **Adjustable Difficulty Levels** - Easy (20 simulations), Medium (50), Hard (150)
- **UCT-Based Selection** - Balances exploration vs exploitation with tunable exploration constant
- **Efficient State Management** - Fast board copying and move generation
- **Interactive GUI** - Play against the AI and watch it think
- **Comprehensive Documentation** - Detailed mathematical analysis and algorithm explanation

### Technical Highlights:
- Tree node implementation with visit counts and win rates
- Random playout simulation with terminal state detection
- Backpropagation with reward inversion for opponent moves
- Best move selection by most-visited node

---

## Dive Deeper

Explore the complete implementation, including detailed mathematical proofs, complexity analysis, and strategy discussion:

**[View Full Documentation on GitHub](https://github.com/Kunle-xy/OguntoyeProjects/tree/main/Monte_Carlo%20Tree%20search/Kunle_Oguntoye_proj2)**

### Quick Start:
1. Clone the repository
2. Navigate to `Monte_Carlo Tree search/Kunle_Oguntoye_proj2`
3. Compile: `javac edu/iastate/cs572/proj2/*.java`
4. Run: `java edu.iastate.cs572.proj2.Checkers`
5. Choose your difficulty level and challenge the AI!

The repository includes extensive documentation covering:
- Why Minimax fails for Checkers (with mathematical analysis)
- The four pillars of MCTS (with algorithm pseudocode)
- Complexity analysis comparing MCTS vs Minimax
- Strategy tips for playing against the AI
- Complete source code with detailed comments

---

## Technical Skills Demonstrated
- Advanced search algorithms and game tree optimization
- Statistical learning through Monte Carlo simulation
- Multi-armed bandit problem (exploration-exploitation tradeoff)
- Java programming with GUI development (Swing)
- Algorithm analysis and complexity evaluation
- Adaptive AI that improves with computational resources

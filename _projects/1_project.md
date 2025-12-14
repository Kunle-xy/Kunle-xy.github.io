---
layout: page
title: A* Algorithm - 8-Puzzle Solver
description: Intelligent pathfinding with admissible heuristics
img: assets/img/a_algorithm.png
importance: 1
category: work
github: https://github.com/Kunle-xy/OguntoyeProjects/tree/main/A*%20algorithm/Kunle_Oguntoye_proj1
---

## Why A* Algorithm Matters

The A* (A-star) algorithm is one of the most widely used pathfinding and graph traversal algorithms in computer science. From GPS navigation systems to video game AI, from robotics to logistics optimization, A* powers intelligent decision-making wherever efficient path discovery is critical. What makes A* particularly powerful is its guarantee to find the optimal solution while exploring fewer nodes than uninformed search algorithms like Breadth-First Search.

This project implements A* to solve the classic 8-puzzle problem—a sliding tile puzzle that serves as an excellent benchmark for evaluating search algorithms.

---

## The A* Formula

At its core, A* evaluates each state using:

$$f(n) = g(n) + h(n)$$

Where:
- $$f(n)$$: Total estimated cost of the path through node $$n$$
- $$g(n)$$: Actual cost from start to node $$n$$ (number of moves made)
- $$h(n)$$: Heuristic estimate of cost from $$n$$ to goal

The algorithm always expands the node with the lowest $$f(n)$$ value, ensuring optimal pathfinding when the heuristic is admissible.

---

## Three Key Properties of A* Heuristics

### 1. Admissibility
A heuristic $$h(n)$$ is **admissible** if it never overestimates the cost to reach the goal. For the 8-puzzle:
- **Manhattan Distance** is admissible: it counts the sum of horizontal and vertical distances each tile must travel
- An admissible heuristic guarantees that A* finds the optimal solution

$$h(n) \leq h^*(n)$$

where $$h^*(n)$$ is the true optimal cost from $$n$$ to the goal.

### 2. Consistency (Monotonicity)
A heuristic is **consistent** if for every node $$n$$ and its successor $$n'$$:

$$h(n) \leq c(n, n') + h(n')$$

where $$c(n, n')$$ is the cost of moving from $$n$$ to $$n'$$.

Consistency ensures that once a node is expanded, the path to it is optimal. Manhattan Distance is consistent for the 8-puzzle, making A* more efficient by avoiding redundant re-expansions.

### 3. Dominance
Heuristic $$h_2$$ **dominates** $$h_1$$ if $$h_2(n) \geq h_1(n)$$ for all nodes $$n$$, and both are admissible. A dominant heuristic provides a tighter bound on the actual cost, leading to fewer node expansions. In this implementation:
- **Manhattan Distance dominates Tile Mismatch** (misplaced tiles)
- Manhattan Distance explores significantly fewer states while maintaining optimality

---

## Implementation Highlights

This Java implementation offers three heuristic strategies:

**1. Tile Mismatch** - Counts tiles not in their goal positions (least informed, explores more nodes)

**2. Manhattan Distance** - Sums the horizontal and vertical distances for each misplaced tile (highly effective)

**3. Double Move Heuristic** - Uses $$\lceil \text{Manhattan Distance} / 2 \rceil$$ for optimized exploration

### Key Features:
- Automatic solvability detection via inversion counting
- Efficient state management with circular doubly-linked lists
- Duplicate state detection and path optimization
- Comparative analysis across all three heuristics

---

## Try It Yourself

Explore the complete implementation, compile the solver, and test it with sample puzzles:

**[View Code on GitHub](https://github.com/Kunle-xy/OguntoyeProjects/tree/main/A*%20algorithm/Kunle_Oguntoye_proj1)**

### Quick Start:
1. Clone the repository
2. Navigate to the project folder
3. Compile: `javac *.java`
4. Run with sample input: `java PuzzleSolver 8Puzzle.txt`

The `8Puzzle.txt` file contains a sample 5-tile puzzle configuration. Try modifying it to test different puzzle scenarios and observe how each heuristic performs!

---

## Technical Skills Demonstrated
- Algorithm design and analysis
- Data structures (circular doubly-linked lists)
- Heuristic evaluation and optimization
- Java programming and OOP principles
- Problem-solving with informed search strategies

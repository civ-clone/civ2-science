# civ2-science

Civilization II's advances and research, as rules on `base-science-research`. It mirrors `civ1-science` rule for rule,
under `civ2-science:` ids, with Civ2's numbers from OpenCiv2's reconstruction of the original
(richardpenman/civ2@49f26ec).

- **Advances:** the 90 rows of RULES.TXT's @CIVILIZE up to Future Technology. That is the 66 shared with Civilization
  (all but Religion), the 23 new ones and Future Technology, each from its own `base-science-advance-*` package.
  `data/advances` holds the numbers in the file's order, and `lib/advanceIndex` answers by that order, never by the
  registry's.
- **Prerequisites:** from `data/advances`. Future Technology needs Fusion Power and Recycling, and can be researched
  again and again. Plumbing is registered but never available.
- **Start:** every civilization starts knowing nothing. `civ2-player`'s start balancing gives poorer starts advances.
- **Choosing:** a player researching nothing must choose. A person is never offered every third candidate (index less
  advances gained, a multiple of 3), except the lowest and except on Chieftain. Computer players see every one.
  `lib/pickResearch` is the game's own pick (`civ_pick_research_advance`).
- **Cost:** `lib/cost`, Civ2's `civ_research_cost`, worked out again at each turn's start. Completing research
  carries nothing over: progress goes back to 0.
- **Research:** a city's research goes to its player, but not under Anarchy or in disorder.
- **Capture:** taking a city takes one of its owner's advances (never a Future Technology), chosen by the captor's
  client.

## Not here yet

- **The cost's reference player.** Civ2 compares with `civs[best_human_rank]`, the civilization in the slot numbered by
  the leading human's power rank. There are no fixed civilization slots here, so this uses the person with the most
  advances (the M2 survey's Q25), and 0 with no person playing.
- **Advances given before the first turn** (the start balancing's) count towards the advances gained. Civ2 doesn't
  count them in `num_advances`, which the cost and the hidden choice use.
- **Disorder:** OpenCiv2 shows no zeroing of a disordered city's science (survey Q33). This keeps Civilization's rule.
- **`advanceValue`** has only the terms that need the advances. The unit terms (expansion by sea), the tribes'
  preferences and the city, wonder and human-lead terms come with the packages they need.
- **Not yet:** Fundamentalism's science cap and loss, the Great Library, Philosophy, Darwin's Voyage, Barracks sold
  on Gunpowder, the Chieftain and space-race doubling of science, and the hidden choice in scenarios.

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
- **Advances counted:** Civ2's `num_advances` starts at 1 (set as the civilization is placed) and rises by 1 for each
  advance gained, Future Technologies included. The cost and the hidden choice both use it.
- **Choosing:** a player researching nothing must choose. A person is never offered every third candidate (index less
  advances counted, a multiple of 3), except the lowest and except on Chieftain. Computer players see every one.
  `lib/pickResearch` is the game's own pick (`civ_pick_research_advance`).
- **Cost:** `lib/cost`, Civ2's `civ_research_cost`, worked out again at each turn's start. Completing research
  carries nothing over: progress goes back to 0. `researchRate` is its ratio without the advances gained, its ramp
  scaled (Civilization II's), whole or left out, and a person's floor optional; `fullRampStep` is the n-th advance's
  cost in steps of the ratio with the whole ramp (`rampedStep` over 1.75), for `civ2-enhanced`'s cost fixed per
  advance (civ-clone/web-renderer#1072). The rule's id is `RuleIds.COST_RULE`;
  `Rules/Research/cost`'s `costInputs` gives `lib/cost`'s inputs for a player.
- **Cost multiplier:** `Rules/Research/RateMultiplier` multiplies a player's cost, rounded to a whole bulb before it
  stops at 32000 (`lib/cost`'s `multipliedCost`), for a rule set such as `civ2-enhanced`'s cost by age
  (civ-clone/web-renderer#1077). Civilization II has no such factor, so this package registers none, and with none in
  force the cost is Civilization II's own, unrounded and unchanged. `Rules/Research/cost`'s `rateMultiplier` asks the
  game's rules for it.
- **Research:** a city's research goes to its player, but not under Anarchy or in disorder.
- **Capture:** taking a city takes one of its owner's advances (never a Future Technology), chosen by the captor's
  client.
- **Fundamentalism** (`city_split_trade`):
  - the split uses no more than COSMIC's 5 tenths for research, persons and computer players alike, and tax takes the
    rest. The research rate itself is left as it is, so leaving Fundamentalism uses all of it again;
  - a computer player's cities turn the luxuries the split gave them into science, before the specialists' yields;
  - a city loses half its science (COSMIC's 50%, rounded down), Scientists' included, before the Library, University
    and Research Lab add their share.

## Not here yet

- **The cost's reference player.** Civ2 compares with `civs[best_human_rank]`, the civilization in the slot numbered by
  the leading human's power rank. There are no fixed civilization slots here, so this uses the person with the most
  advances (the M2 survey's Q25). With no person playing (an all-computer game, or one only watched, whose observer
  has no seat), the original has no answer, as it always has a person: here the player with the most advances stands
  in, barbarians left out (`referenceAdvances`). Against a reference of 0 every computer player was a whole count
  ahead, and paid 1.5 to 2.3 times as much for each advance from 20 advances on at King.
- **Advances given before the first turn** (the start balancing's) count towards the advances gained. Civ2 doesn't
  count them in `num_advances`, which the cost and the hidden choice use.
- **Disorder:** OpenCiv2 shows no zeroing of a disordered city's science (survey Q33). This keeps Civilization's rule.
- **`advanceValue`** has only the terms that need the advances. The unit terms (expansion by sea), the tribes'
  preferences and the city, wonder and human-lead terms come with the packages they need.
- **Not yet:** Philosophy, the Chieftain and space-race doubling of science, and the hidden choice in scenarios. The
  Great Library and Darwin's Voyage are civ2-wonder's, and Barracks sold on Gunpowder civ2-city-improvement's.

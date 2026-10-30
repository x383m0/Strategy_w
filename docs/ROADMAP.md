# Feuille de route

## v0.1 — Prototype disponible

Production, déplacements, renforts, combats de bâtiments et en chemin, captures, victoire/défaite, sélection multiple, pause, trois cartes symétriques et réglage des envois.

Première IA heuristique : scores d’utilité pour l’expansion et l’offensive, estimation de la production pendant les trajets, réserves défensives, renforts, repli et regroupement au front. Plusieurs départs peuvent contribuer à une même cible. Le mode développeur montre ses vrais scores et ses décisions.

Validation : 14 tests automatisés, vérification manuelle du lancement, glisser-déposer, capture, pause et affichage des décisions dans le navigateur.

## Phase 2 — Stratégie et robustesse

- Mieux estimer l’ordre des arrivées et les interceptions en chemin.
- Synchroniser les arrivées des attaques coordonnées ; actuellement les groupes partent ensemble et arrivent selon leur distance.
- Comparer les stratégies sur plusieurs cartes et mesurer les victoires contre des références.
- Tester et ajuster les trois difficultés avec des joueurs.

## Phase 3 — Interface et lisibilité

- Retours utilisateur sur les contrôles, les dimensions du terrain et les effectifs affichés.
- Tests dédiés sur téléphone/tablette et amélioration de l’ergonomie tactile.
- Lisibilité des grands engagements et optimisation si les cartes grandissent.

## Phase 4 — IA avancée

Recherche avec simulations futures, anticipation des interceptions et adaptation explicable. Le prototype actuel n’utilise ni réseau neuronal, ni apprentissage, ni recherche MCTS. Ne pas annoncer l’Expert avant d’en mesurer la force.

## Phase 5 — Équilibrage et finition

Parties complètes, tests de performance, qualité des menus et choix des paramètres avec le propriétaire.

## Phase 6 — Multijoueur (en dernier)

Décider ensemble de l’architecture réseau et de ses services complémentaires ; implémenter Host/Join, code de connexion, commandes validées, synchronisation, déconnexions et tests sur deux ordinateurs et plusieurs réseaux.

## Mise à jour v0.1.7

Statistiques propres aux bâtiments, fiche au survol, défense, vitesse de départ et capacité stricte avec réservations implémentées. L’IA exploite ces statistiques. 27 tests passent. Le choix du comportement à capacité est résolu.

## Mise à jour v0.2.0

Maisons, casernes et forts, transformation à 10 troupes, tirs automatiques et portée visible, IA capable de se spécialiser. 39 tests passent. Prochaine priorité : retours de parties pour ajuster portée/cadence et production, puis meilleure évaluation des routes exposées aux forts par l’IA.

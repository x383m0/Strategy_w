# Jelly Wars — v0.9.1

Jeu de stratégie en français, Canvas et SVG, sans dépendance de compilation. Huit cartes de neuf bâtiments, solo contre une IA et duel à deux.

## Jouer et publier

Le fichier `index.html` à la racine est autonome : code et styles sont intégrés. Le remplacer dans le dépôt GitHub Pages suffit à mettre le jeu à jour. Vérifier « Version 0.9.1 » dans le menu. Ne pas publier `templates/page.html` à sa place.

Pour jouer localement : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000`.

## Nouveautés 0.9.1

Les salons utilisent six lettres majuscules, par exemple KRMVTA, sans chiffres ni caractères spéciaux. Les minuscules saisies sont acceptées. Le bouton Copier le code partage exactement ces six lettres ; aucun lien n’est obligatoire. Un code Internet déjà occupé est remplacé automatiquement.

## Nouveautés 0.9.0

- Style C validé : maison à toit simple, fort octogonal et silo horizontal à trappes et missile visible. Les boutons SVG utilisent la même géométrie que les bâtiments. Quatre niveaux de maisons/forts, trois de silos.
- IA : épargne pour améliorer ses maisons, priorités de défense conservées et déblocage des missiles du silo. Les coûts, ressources et délais de réflexion restent identiques. Mesures avant/après dans `docs/IA.md`.
- Duel Internet automatique : créer un salon, partager le lien ou le code, rejoindre. Connexion via PeerJS Cloud, sans adresse à saisir. La bibliothèque et sa licence sont incluses. Un réseau qui bloque WebRTC peut nécessiter un relais personnalisé.

## Nouveautés 0.8.0

- Cinq missions avec objectifs, inventaires de départ, assauts payés et progression locale. Détails dans `docs/CAMPAGNE.md`.
- Salons à six caractères via un relais HTTP optionnel fourni dans `server/`. Aucun service public préconfiguré ; GitHub Pages seul ne peut pas lancer ce serveur. Voir `docs/MULTIJOUEUR.md`.
- Forts placés en soutien des maisons : chaque fort couvre au moins une maison sans montagne entre les deux ; les positions centrales en couvrent deux sur les variantes standard. Les déplacements conservent la symétrie des cartes libres. Le survol du fort indique les maisons alliées couvertes.
- Comparatif des trois pistes dans `docs/designs/building-options.png` et `.svg` ; le style C est maintenant intégré.
- Premier benchmark de 18 parties IA et rapport `docs/EQUILIBRAGE.md`. Il compare des stratégies et ne remplace pas des parties humaines.

## Première refonte

- Silhouettes propres aux types : maison à toit simple, fort octogonal avec tourelle, silo horizontal avec trappes et missile visible. Quatre niveaux pour maisons et forts, trois pour silos.
- Miniatures SVG sur les boutons de transformation et d’amélioration, symbole + ou niveau suivant et coût séparé. Noms et conséquences accessibles au survol/focus.
- Menu de terrain avec aperçu SVG, descriptions et conseils d’ouverture. Trois cartes retravaillées : Carrefour, Deux fronts, Forteresse. Le total reste huit cartes.
- Terrain dominant, colonne de force compacte. Audio et duel dans des fenêtres dédiées, analyse de l’IA repliée.
- Aperçu d’ordre : effectif, délai, proportion et exposition approximative aux forts. Zones de tir mises en évidence. L’estimation ne prédit pas les interceptions, les renforts ou le partage des tirs entre plusieurs groupes.
- Missiles : mêmes coûts et fabrications, vol de quatre secondes avec compte à rebours et alerte sur les bâtiments alliés ciblés. Possibilité d’évacuer sa garnison. L’IA Normal/Difficile peut réagir à un EMP.
- IA : prise en compte des tirs possibles sur les trajets, intérêt des positions fortifiées et des silos en activité. Aucune ressource gratuite.
- Accompagnement optionnel : indications progressives sur les ordres, forts ou missiles, première action de l’IA retardée à 25 secondes en solo. Les cinq nouvelles missions se choisissent séparément dans Opération.
- Bilan : production, envois, pertes, captures, missiles, surcharge et dernières captures. Les dernières armées ennemies sont encerclées lorsque leur camp n’a plus de bâtiment.

## Commandes

Glisser d’un bâtiment de son camp vers une cible envoie 50 %. Maj + glisser envoie 100 %. Maj + clic ou rectangle de sélection permet de commander plusieurs bâtiments. Les troupes combattent aussi en chemin. Espace ou bouton de pause suspend la partie.

Survol d’un bâtiment : statistiques compactes par icônes, commandes flottantes au-dessus. Améliorer une maison ou la transformer verrouille son type, même après capture. La légende sous le terrain indique les trois silhouettes.

En partie libre ou en duel, la victoire exige l’élimination de tous les bâtiments et troupes ennemis ; les missiles déjà en vol peuvent encore changer l’issue. La campagne utilise les objectifs annoncés avant chaque mission.

## Statistiques et terrain

Maisons : production 0,5 / 1 / 1,5 / 2 troupes/s ; capacité 20 / 30 / 40 / 50 ; défense 1. Forts : défense 2 / 2,5 / 3 / 3,5 ; capacité 50 / 65 / 80 / 100 ; portée 240 / 260 / 280 / 300 ; 2 tirs/s d’un dégât, avec au moins une troupe. Silos : capacité 50 / 75 / 100, aucune production.

Vitesse commune : 45. Au-dessus de sa capacité, un bâtiment allié perd 10 % de son surplus par seconde ; les renforts restent autorisés. Les montagnes bloquent déplacements et tirs de fort ; les missiles survolent le relief. Eau et routes n’accordent aucun bonus. Les groupes deviennent visuellement des bateaux sur l’eau libre.

Les forts neutres attaquent les deux camps. Leur nombre peut être réglé avant partie. Les garnisons des positions centrales et des premières captures des trois cartes retravaillées sont revues ; les statistiques des types sont conservées.

Silo : transformation 10, améliorations 20 et 40. Balistique 25 troupes/10 s, neutralise ; poison 30/10 s, enlève une troupe toutes les deux secondes jusqu’à capture ; EMP 40/15 s, capture. Garde de la garnison lors de neutralisation/EMP. Un missile fabriqué à la fois, cible choisie ensuite. Capture du silo : fabrication annulée et stock perdu.

## Duel

Duel → Internet · automatique → Créer un salon, puis Copier le lien du salon. Le second joueur ouvre le lien et rejoint. Les deux joueurs doivent utiliser la même version. L’hôte est bleu, l’invité rouge. Aucun bot en duel ; l’hôte valide les commandes et transmet l’état dix fois par seconde.

Le mode automatique utilise PeerJS Cloud pour la mise en relation. Certains réseaux peuvent bloquer la connexion directe : choisir alors Relais personnalisé, qui nécessite un service HTTPS à héberger séparément. Le serveur Node optionnel est inclus, sans dépendance ; `npm run dev` sert jeu et relais localement, `npm run relay` lance l’API seule. Les codes LOCAL restent réservés au même navigateur.

Consulter `docs/MULTIJOUEUR.md` pour l’installation du relais et les limites de validation. Création d’un salon Internet vérifiée, mais la négociation WebRTC a expiré dans le navigateur de développement. Le duel par relais a été vérifié dans deux onglets ; aucun test entre deux machines distantes n’a été réalisé. Garder l’onglet hôte ouvert ; une déconnexion arrête le duel.

## Développement et vérification

`npm test` : 164 tests. `npm run audit` : 24 simulations avec replays exacts. `npm run balance` : 18 simulations comparatives. `npm run build` génère le fichier racine et `dist/index.html`. Les sources sont dans `src/`, `style.css` et `templates/page.html`.

Les tests vérifient la simulation, les coûts, captures, collisions continues aux virages, missiles, pause, commandes réseau, aperçus et démarrage du HTML autonome. Ils ne constituent pas une preuve d’équilibrage entre joueurs.

Voir `docs/REFONTE.md` pour l’état des dix axes et le travail restant. L’historique des versions est conservé dans `docs/HISTORIQUE.md`.

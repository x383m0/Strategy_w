# Jelly Wars — v0.7.0

Jeu de stratégie en français, Canvas et SVG, sans dépendance de compilation. Huit cartes de neuf bâtiments, solo contre une IA et duel à deux.

## Jouer et publier

Le fichier `index.html` à la racine est autonome : code et styles sont intégrés. Le remplacer dans le dépôt GitHub Pages suffit à mettre le jeu à jour. Vérifier « Version 0.7.0 » dans le menu. Ne pas publier `templates/page.html` à sa place.

Pour jouer localement : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000`.

## Première refonte

- Silhouettes propres aux types : quartier résidentiel, fort à quatre bastions avec tourelle, silo allongé avec trappes et missiles visibles. Quatre niveaux pour maisons et forts, trois pour silos.
- Miniatures SVG sur les boutons de transformation et d’amélioration, symbole + ou niveau suivant et coût séparé. Noms et conséquences accessibles au survol/focus.
- Menu de terrain avec aperçu SVG, descriptions et conseils d’ouverture. Trois cartes retravaillées : Carrefour, Deux fronts, Forteresse. Le total reste huit cartes.
- Terrain dominant, colonne de force compacte. Audio et duel dans des fenêtres dédiées, analyse de l’IA repliée.
- Aperçu d’ordre : effectif, délai, proportion et exposition approximative aux forts. Zones de tir mises en évidence. L’estimation ne prédit pas les interceptions, les renforts ou le partage des tirs entre plusieurs groupes.
- Missiles : mêmes coûts et fabrications, vol de quatre secondes avec compte à rebours et alerte sur les bâtiments alliés ciblés. Possibilité d’évacuer sa garnison. L’IA Normal/Difficile peut réagir à un EMP.
- IA : prise en compte des tirs possibles sur les trajets, intérêt des positions fortifiées et des silos en activité. Aucune ressource gratuite.
- Accompagnement optionnel : indications progressives sur les ordres, forts ou missiles, première action de l’IA retardée à 25 secondes en solo. Il s’agit de guides de partie, pas encore d’une campagne de missions.
- Bilan : production, envois, pertes, captures, missiles, surcharge et dernières captures. Les dernières armées ennemies sont encerclées lorsque leur camp n’a plus de bâtiment.

## Commandes

Glisser d’un bâtiment de son camp vers une cible envoie 50 %. Maj + glisser envoie 100 %. Maj + clic ou rectangle de sélection permet de commander plusieurs bâtiments. Les troupes combattent aussi en chemin. Espace ou bouton de pause suspend la partie.

Survol d’un bâtiment : statistiques compactes par icônes, commandes flottantes au-dessus. Améliorer une maison ou la transformer verrouille son type, même après capture. La légende sous le terrain indique les trois silhouettes.

La victoire exige l’élimination de tous les bâtiments et troupes ennemis ; les missiles déjà en vol peuvent encore changer l’issue.

## Statistiques et terrain

Maisons : production 0,5 / 1 / 1,5 / 2 troupes/s ; capacité 20 / 30 / 40 / 50 ; défense 1. Forts : défense 2 / 2,5 / 3 / 3,5 ; capacité 50 / 65 / 80 / 100 ; portée 240 / 260 / 280 / 300 ; 2 tirs/s d’un dégât, avec au moins une troupe. Silos : capacité 50 / 75 / 100, aucune production.

Vitesse commune : 45. Au-dessus de sa capacité, un bâtiment allié perd 10 % de son surplus par seconde ; les renforts restent autorisés. Les montagnes bloquent déplacements et tirs de fort ; les missiles survolent le relief. Eau et routes n’accordent aucun bonus. Les groupes deviennent visuellement des bateaux sur l’eau libre.

Les forts neutres attaquent les deux camps. Leur nombre peut être réglé avant partie. Les garnisons des positions centrales et des premières captures des trois cartes retravaillées sont revues ; les statistiques des types sont conservées.

Silo : transformation 10, améliorations 20 et 40. Balistique 25 troupes/10 s, neutralise ; poison 30/10 s, enlève une troupe toutes les deux secondes jusqu’à capture ; EMP 40/15 s, capture. Garde de la garnison lors de neutralisation/EMP. Un missile fabriqué à la fois, cible choisie ensuite. Capture du silo : fabrication annulée et stock perdu.

## Duel

L’hôte choisit la carte puis ouvre Duel et crée une invitation. Copier son lien ou son code. L’invité ouvre le lien, clique Rejoindre et renvoie sa réponse ; l’hôte colle cette réponse et confirme. Les versions doivent être identiques. L’hôte est bleu, l’invité rouge. L’hôte valide les ordres et envoie l’état dix fois par seconde.

Connexion directe WebRTC/STUN sans relais TURN. Certains réseaux peuvent la bloquer. Le test de connexion entre ordinateurs reste non validé dans l’environnement de développement : aucun candidat ICE n’était disponible. Les invitations sans chemin réseau sont refusées explicitement.

« Tester dans 2 onglets » utilise un code LOCAL exclusivement entre onglets du même navigateur et du même site. Le lien local, les menus et la connexion ont été vérifiés dans le navigateur après la refonte. Le fonctionnement local ne prouve pas la connectivité Internet.

Une déconnexion arrête la partie ; recréer une invitation pour rejouer. Garder l’onglet hôte ouvert. Les menus mettent en pause ; en duel, reprendre explicitement la partie après fermeture.

## Développement et vérification

`npm test` : 140 tests. `npm run audit` : 24 simulations avec replays exacts. `npm run build` génère le fichier racine et `dist/index.html`. Les sources sont dans `src/`, `style.css` et `templates/page.html`.

Les tests vérifient la simulation, les coûts, captures, collisions continues aux virages, missiles, pause, commandes réseau, aperçus et démarrage du HTML autonome. Ils ne constituent pas une preuve d’équilibrage entre joueurs.

Voir `docs/REFONTE.md` pour l’état des dix axes et le travail restant. L’historique des versions est conservé dans `docs/HISTORIQUE.md`.

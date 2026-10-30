# Jelly Wars — v0.2.6

Jeu de conquête en temps réel, en français, contre une IA heuristique équitable. JavaScript natif, HTML5 Canvas et CSS, sans dépendance ni serveur de jeu en solo.

## Jouer localement

Depuis ce dossier :

```sh
python -m http.server 8000
```

Ouvrir `http://localhost:8000`. Le fichier `index.html` fourni contient tout le code et les styles nécessaires au jeu.

## GitHub Pages

Pour corriger le lancement, remplacer le fichier `index.html` à la racine du dépôt par celui de la v0.2.3. Vous pouvez aussi importer tout le contenu de ce dossier pour conserver les sources à jour. Dans Settings → Pages, choisir Deploy from a branch, puis la branche principale et le dossier `/ (root)`. Le jeu publié utilise uniquement `index.html`, autonome : aucun chargement de `src/` ou de `style.css` ne peut mélanger les versions. Il fonctionne sous un sous-dossier de dépôt.

Aucune compilation n’est nécessaire pour publier les fichiers fournis. Après une modification des sources, lancer `npm run build` : il assemble `templates/page.html`, `style.css` et `src/` dans le fichier autonome `index.html`, ainsi que dans `dist/index.html`. Ne pas modifier directement le fichier HTML généré. Après publication, vérifier que le menu indique 0.2.3.

## Commandes

- Glisser d’un bâtiment bleu à une cible : envoyer 50 % des troupes par défaut.
- Maj + glisser : toutes les troupes disponibles, vers une cible alliée, neutre ou ennemie. Le double-clic est retiré.
- Maj + clic ou rectangle dans le fond : sélection multiple. Glisser d’un bâtiment sélectionné : ordre commun.
- Espace : pause/reprise lorsque le terrain a le focus. Le bouton de pause est toujours disponible.
- Échap : désélectionner. `?` ou Comment jouer : aide.
- Mode développeur : scores, cibles, routes et journal issus des calculs de l’IA.

Les groupes combattent en chemin et aux bâtiments à raison de 1 pour 1. Un survivant est nécessaire pour capturer un bâtiment. La victoire exige l’élimination de tous les bâtiments et groupes adverses.

## Validation

Node.js 20 ou plus récent :

```sh
npm test
npm run build
```

Les 57 tests automatisés passent. Ils couvrent production, commandes invalides, captures, égalités, renforts, collisions continues, arrivées simultanées, pause, victoire, conservation des unités de l’IA replay des commandes, renfort défensif de l’IA, engagements à trois groupes et simulations déterministes IA contre IA sur les trois cartes.

## Architecture et limites

- `src/game/` : état sérialisable, commandes, simulation fixe à 30 Hz et combats.
- `src/ai/` : évaluation des cibles, analyse des menaces, allocation et contrôleur.
- `src/input/` et `src/rendering/` : contrôles et Canvas.
- `src/main.js` : assemblage, interface et boucle de jeu.
- `docs/DECISIONS.md` : choix confirmés, paramètres provisoires, questions ouvertes.
- `docs/ROADMAP.md` : étapes suivantes.
- `src/multiplayer/README.md` : préparation du réseau, sans implémentation prématurée.

L’IA utilise des règles et des scores, sans apprentissage. La recherche stratégique approfondie, la prédiction précise des interceptions, la synchronisation des arrivées, l’Expert et le multijoueur sont des étapes futures. Les trois difficultés actuelles demandent encore de l’équilibrage. Les écrans tactiles sont pris en charge par les événements de pointeur mais les tests dédiés sur appareils restent à faire.

## v0.1.1 — Rythme plus posé

Distances entre les centres des bâtiments augmentées de 40 % sur les trois cartes et vitesse des troupes abaissée de 105 à 68 unités/s, pour les deux camps. Les trajets sont environ 2,3 fois plus longs (davantage pour les trajets courts). La production reste à +1/s. Remplacer les fichiers du dépôt par cette version.

## v0.1.2 — Adversaires plus patients

Facile : première décision après 8 s, puis une évaluation toutes les 6 s (contre 2,8 s). Normal : première décision après 5 s, puis toutes les 3 s (contre 1,2 s). Chaque évaluation peut produire un plan coordonné ; une évaluation ne garantit pas un envoi. Difficile conserve sa cadence de 0,55 s et son premier calcul à 1,5 s. Vitesse commune des troupes : 44 unités/s au lieu de 68, soit −35 % environ. Les trajets durent 55 % plus longtemps que dans la v0.1.1. Les distances et la production sont conservées.

## v0.1.3 — Version visible

Le menu de lancement affiche « Jelly Wars · Version 0.1.3 ». Le numéro est aussi présent dans l’en-tête et le pied de page. Les réglages de rythme de la v0.1.2 sont conservés.

## v0.1.4 — Troupes plus visibles

Les trois cartes actuelles contiennent chacune 9 bâtiments : 1 joueur, 1 IA et 7 neutres. Disposition symétrique à 180 degrés. Distances conservées (facteur d’espacement 1,4). Les symboles des troupes sont agrandis de 70 % ; leur effectif est plus grand, en gras et détouré en blanc. Vitesse commune : 45 unités/s. Les collisions ne changent pas de taille. Le nombre de bâtiments pourra varier pour de futures cartes. Le système de statistiques au survol reste à finaliser après le choix du comportement des renforts à capacité.

## v0.1.5 — Double-clic pour tout envoyer

Sélectionner un ou plusieurs bâtiments bleus, puis double-cliquer sur une cible pour envoyer 100 % des troupes actuellement disponibles. Après un glisser-déposer à 50 %, le double-clic envoie le reste. La proportion réglée pour les prochains glisser-déposer est conservée. L’action utilise la validation commune, ne fonctionne pas en pause, et ignore les sources capturées.

## v0.1.6 — Bâtiments agrandis

Les bâtiments et leurs effectifs sont agrandis de 20 %. Le rayon passe de 31 à 37,2 unités de carte ; sélection, survol, départs et arrivées suivent cette taille. Les centres des bâtiments, le nombre de bâtiments et la vitesse des troupes sont conservés.

## v0.1.7 — Statistiques et capacité stricte

Chaque bâtiment a désormais ses propres statistiques : défense 1, génération 1 troupe/s, vitesse des groupes envoyés 45 unités/s et capacité 50. Elles sont visibles dans une fiche au survol, sous le bâtiment (au-dessus si le bord inférieur manque de place). Tous les bâtiments actuels utilisent ces valeurs de base ; aucun nouveau type ni amélioration n’est ajouté.

- La production s’arrête à la capacité, sans accumuler de troupes cachées. Elle reprend lorsqu’une place est libérée.
- Les groupes en route réservent la capacité de destination pour leur camp. La production n’occupe pas ces places.
- Pour les renforts alliés, garnison + troupes de ce camp en route + nouvel envoi ne doivent pas dépasser 50. Pour une cible adverse ou neutre, le total des troupes d’un camp en route vers cette cible est limité à 50 afin de garantir le plafond après capture.
- Si un ordre, même à plusieurs sources, dépasse la place disponible, il est refusé en entier : aucune troupe ne quitte les bâtiments et aucune n’est supprimée. Choisir un pourcentage plus petit permet de réessayer. Cette règle s’applique aussi au double-clic et à l’IA.
- La défense protège uniquement la garnison du bâtiment. Défense 2 : 10 attaquants infligent 5 pertes aux défenseurs ; 20 attaquants contre 10 défenseurs donnent une égalité, le bâtiment reste au défenseur avec 0 troupe. Les petits dégâts sont conservés entre arrivées successives. La défense ne change pas les combats en chemin.
- La vitesse est fixée par le bâtiment de départ et conservée pour tout le trajet, même si ce bâtiment change ensuite de propriétaire.
- L’IA utilise défense, capacité, production plafonnée et vitesse de chaque source dans ses estimations. Les difficultés conservent leur cadence.

Validation : 27 tests réussis, y compris limites, réservation des renforts, refus atomiques, défense, vitesses différentes, conservation des unités et parties déterministes. Fiche au survol vérifiée dans le navigateur.

## v0.2.0 — Maisons, casernes et forts

Tous les bâtiments commencent comme maisons. Sélectionner une seule maison bleue, puis choisir sa spécialisation dans le panneau sous le terrain. Chaque transformation coûte 10 troupes de sa garnison ; elle est immédiate, définitive et commune aux règles du joueur et de l’IA. Le type est conservé après capture.

| Type | Défense | Production | Vitesse | Capacité |
| --- | --- | --- | --- | --- |
| Maison (ronde) | 1 | 1/s | 45 | 50 |
| Caserne (carrée) | 1 | 2/s | 45 | 50 |
| Fort (hexagonal) | 2 | 0/s | 45 | 50 |

Réglages provisoires du fort : portée de 240 unités de carte, 1 dégât par seconde sur le groupe ennemi le plus proche à portée, garnison d’au moins 1 troupe requise. Les tirs ne consomment pas de garnison. Le cercle de portée s’affiche au survol ou à la sélection. Les tirs sont résolus par la simulation à pas fixe et leur trait visuel ne modifie pas leur résultat. Sans ennemi à portée, les tirs ne sont pas accumulés. Un fort neutre ne tire pas.

L’IA peut transformer ses maisons, privilégie les casernes et peut créer un fort de première ligne en Normal/Difficile. Elle paie les mêmes 10 troupes et conserve les cadences de décision de chaque difficulté. Son journal explique ses spécialisations. Les dépenses de transformation sont suivies séparément des pertes au combat.

Validation : 39 tests réussis, vérification des transformations en caserne et en fort dans le navigateur. Les limites de capacité, réservations, envois, double-clic et captures des versions précédentes restent actifs. La force de l’IA et l’équilibrage des forts restent à tester avec des joueurs. Aucun laboratoire ni amélioration par niveaux pour le moment.

## v0.2.1 — Fiche interactive et armées lisibles

- Survol d’un bâtiment : fiche contrastée avec défense, génération, vitesse et capacité. Aucune sélection nécessaire. Les statistiques restent visibles pour les bâtiments neutres et adverses.
- Sur une maison alliée, deux petites icônes Caserne/Fort sont intégrées à la fiche. Le coût de 10 troupes est affiché. Les icônes se désactivent si la garnison est insuffisante ou en pause. Elles agissent sur le bâtiment survolé, indépendamment d’une sélection multiple.
- La fiche reste ouverte pendant le passage du bâtiment aux icônes et lorsque le pointeur ou le focus est dans la fiche ; elle se ferme en quittant cette zone. Elle est masquée pendant les glisser-déposer et les menus. Sur écran tactile, un toucher sur le bâtiment peut afficher la fiche.
- Suppression du panneau Déploiement à droite et du panneau Spécialisation sous le terrain. Glisser envoie 50 % et le double-clic conserve l’envoi à 100 %.
- Les groupes d’armées sont représentés par des cercles colorés contenant leur effectif. Le rayon augmente avec la racine carrée du nombre de troupes, avec un plafond visuel pour garder la carte lisible. La bulle rétrécit avec les pertes. Ce changement est graphique ; vitesse, force et collisions restent identiques.
- Les fichiers d’entrée HTML, CSS et les modules d’interface modifiés portent un identifiant de version pour renouveler leur cache lors de la mise à jour sur GitHub Pages. Le menu doit indiquer 0.2.1.

Validation : 43 tests réussis ; vérification navigateur de la fiche, du clic sur les icônes, de la suppression du panneau et du rendu des bulles d’armées.

## v0.2.3 — Correction du lancement sur GitHub Pages

Le site pouvait charger une interface sans panneau Déploiement avec un ancien JavaScript qui cherchait encore ce panneau. L’initialisation s’arrêtait avant de brancher le bouton de lancement. Le fichier livré `index.html` contient désormais les styles et tous les modules du jeu assemblés ensemble : remplacer ce seul fichier suffit pour mettre à jour le jeu publié. Les sources restent disponibles dans `src/`, la mise en page dans `templates/page.html`. Aucun changement de règles ou d’équilibrage.

Validation : 44 tests réussis, dont un test de l’entrée HTML assemblée sans chargement externe : lancement, progression du temps et de la production, pause, reprise et nouvelle partie.

## v0.2.3 — Import GitHub sans ambiguïté

Le modèle de développement est renommé `templates/page.html`. Le ZIP ne contient désormais qu’un seul fichier nommé `index.html`, à la racine : il contient tout le jeu. Pour la mise à jour publiée, remplacer uniquement ce fichier dans le dépôt, puis vérifier la version 0.2.3 dans le menu.

## v0.2.4 — Commandes flottantes au survol

Deux boutons circulaires Caserne et Fort flottent au-dessus de la maison alliée, avec icônes et coût de 10 troupes. Une fiche de 184 px sous le bâtiment présente les quatre statistiques sur deux lignes. Les boutons et les stats sont séparés, le centre reste disponible pour commander les troupes. Le survol reste ouvert pendant le passage vers les commandes. Les interfaces sont ramenées dans la carte aux bords. Les règles et coûts ne changent pas.

Validation : 46 tests réussis, démarrage et transformation en caserne via le bouton flottant vérifiés dans le navigateur.

## v0.2.5 — Maj + glisser et nouvelle caserne

Maj + glisser remplace le double-clic pour envoyer toutes les troupes disponibles. Glisser sans Maj conserve 50 %. Maj + clic ajoute ou retire une source ; la désélection est différée jusqu’au relâchement pour ne pas empêcher un glisser depuis un bâtiment déjà sélectionné. Un second pointeur ne peut plus interrompre ou détourner un glisser en cours.

Caserne : 1,5 troupe/s, capacité 80, coût de transformation 10 troupes inchangé. Maisons et forts : capacité 50. Les réservations de capacité sont adaptées au type, et les ordres trop grands sont toujours refusés en entier. Les troupes restent entières : 3 troupes produites toutes les 2 secondes.

Fort : cadence doublée, un tir de 1 dégât toutes les 0,5 seconde (2 dégâts/s), portée 240 inchangée. Le survol et l’aide affichent cette cadence.

Aperçu de portée : cercle pointillé de rayon 240 au survol d’un fort, maintenu sur sa fiche. Avant construction, survoler ou cibler au clavier le bouton Fort d’une maison pour afficher sa future portée. Aucun coût ni transformation avant le clic.

Validation v0.2.5 : 54 tests réussis ; aperçu avant construction et démarrage vérifiés dans le navigateur. Audit complémentaire : 9 simulations sur les trois cartes, 2 563 commandes et 24 807 ticks ; vérification des capacités, effectifs entiers et refus atomiques.

## v0.2.6 — Corrections et nettoyage

- La difficulté choisie avant lancement configure aussi le premier délai de décision : Facile 8 s, Normal 5 s, Difficile 1,5 s.
- Une perte de capture du pointeur annule le glisser : aucun ordre fantôme au retour, ni blocage des prochains gestes.
- Le journal d’envoi stocke uniquement les champs validés et le tick réel de simulation ; les métadonnées d’une commande ne peuvent plus modifier la date du replay.
- Contrôleur des entrées remis en forme, sélection par rectangle isolée, tolérance de clic nommée et nettoyage de sélection simplifié. Le pointeur de survol est réinitialisé avec la partie.
- Les numéros de version visibles sont générés depuis `package.json`, pour éviter les écarts entre l’en-tête, le menu et le pied de page.

Validation : 57 tests réussis. `npm run audit` effectue 9 simulations reproductibles sur les trois cartes, contrôle les capacités et les refus sans mutation, puis rejoue exactement toutes les commandes. Dernier passage : 2 966 commandes, 27 946 ticks, 9 replays identiques.

Les réglages de la v0.2.5 sont conservés : Maj + glisser 100 %, caserne 1,5/s et 80 places, fort 2 tirs/s et portée 240.

# Jelly Wars — v0.4.3

Jeu de conquête en temps réel, en français, contre une IA heuristique équitable. JavaScript natif, HTML5 Canvas et CSS, sans dépendance ni serveur de jeu en solo.

## Jouer localement

Depuis ce dossier :

```sh
python -m http.server 8000
```

Ouvrir `http://localhost:8000`. Le fichier `index.html` fourni contient tout le code et les styles nécessaires au jeu.

## GitHub Pages

Pour corriger le lancement, remplacer le fichier `index.html` à la racine du dépôt par celui de la version fournie. Vous pouvez aussi importer tout le contenu de ce dossier pour conserver les sources à jour. Dans Settings → Pages, choisir Deploy from a branch, puis la branche principale et le dossier `/ (root)`. Le jeu publié utilise uniquement `index.html`, autonome : aucun chargement de `src/` ou de `style.css` ne peut mélanger les versions. Il fonctionne sous un sous-dossier de dépôt.

Aucune compilation n’est nécessaire pour publier les fichiers fournis. Après une modification des sources, lancer `npm run build` : il assemble `templates/page.html`, `style.css` et `src/` dans le fichier autonome `index.html`, ainsi que dans `dist/index.html`. Ne pas modifier directement le fichier HTML généré. Après publication, vérifier que le menu indique 0.4.3.

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

Les 113 tests automatisés passent. Ils couvrent production, commandes invalides, captures, égalités, renforts, collisions continues, arrivées simultanées, pause, victoire, conservation des unités de l’IA replay des commandes, renfort défensif de l’IA, engagements à trois groupes et simulations déterministes IA contre IA sur les trois cartes.

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

## v0.3.0 — Architecture contemporaine et quatre niveaux

Les maisons, casernes et forts ont chacun quatre dessins progressifs : béton, toitures aux couleurs du camp, cours centrales et postes de garde. Les quatre points sous le bâtiment indiquent le niveau. Les dimensions de la carte, les rayons de sélection/collision et la vitesse 45 sont conservés.

Une maison de niveau 1 peut soit monter au niveau 2, soit devenir une caserne ou un fort de niveau 1. Dès la première amélioration ou spécialisation, le type est définitif. Le verrouillage, le niveau et le type sont conservés lors d’une capture. Une maison améliorée ne peut donc plus être convertie, même par son nouveau propriétaire.

La flèche flottante au survol améliore le bâtiment. Les boutons Caserne/Fort ne sont présents que pour les maisons de niveau 1 sans verrouillage. Le coût, le prochain niveau et les prochaines statistiques sont affichés au survol du bouton. Pour un fort, le bouton d’amélioration prévisualise sa prochaine portée. Au niveau 4, les commandes d’amélioration disparaissent.

### Première proposition d’équilibrage (provisoire)

Coût en garnison pour N1→N2 : 10 troupes ; N2→N3 : 20 ; N3→N4 : 30. Transformation initiale en caserne ou fort : 10 troupes, inchangé. Les coûts sont suivis dans les dépenses, pas les pertes.

| Type / statistique | N1 | N2 | N3 | N4 |
| --- | --- | --- | --- | --- |
| Maison : production/s | 1 | 1,25 | 1,5 | 2 |
| Maison : capacité | 50 | 65 | 80 | 100 |
| Caserne : production/s | 1,5 | 2 | 2,5 | 3 |
| Caserne : capacité | 80 | 100 | 120 | 150 |
| Fort : défense | 2 | 3 | 4 | 5 |
| Fort : portée | 240 | 260 | 280 | 300 |
| Fort : capacité | 50 | 65 | 80 | 100 |

La défense des maisons/casernes reste 1. La vitesse reste 45 pour tous. Les forts ne produisent pas et gardent 2 tirs/s, 1 dégât par tir. Ces valeurs au-dessus du niveau 1 sont une proposition initiale, sans prétention d’équilibrage définitif.

Les améliorations ne remettent pas à zéro le cooldown des tirs et n’effacent pas les dégâts défensifs partiels. Les réservations de capacité suivent la nouvelle capacité. L’IA peut améliorer ses bâtiments avec les mêmes coûts, à partir de 30 secondes et avec des réserves suffisantes, sans augmenter sa cadence de décision.

Validation : 68 tests réussis ; 9 simulations, 2 753 commandes et 25 928 ticks, avec 9 replays strictement identiques. Vérification navigateur des 12 dessins, du lancement, de l’amélioration de maison et du masquage des conversions après verrouillage.

## v0.3.1 — Nouvelle progression des casernes

| Niveau | Production/s | Capacité |
| --- | --- | --- |
| 1 | 0,5 | 20 |
| 2 | 1 | 30 |
| 3 | 1,5 | 40 |
| 4 | 2 | 50 |

Cette grille remplace les précédentes valeurs de caserne. Les maisons et les forts ne changent pas. Coûts d’amélioration et verrouillage du type conservés.

Une conversion ne doit pas supprimer de troupes ni dépasser la nouvelle capacité : le coût de 10 est soustrait de la garnison, puis garnison restante et réservations doivent tenir dans 20 places. Les réservations de chaque camp sont contrôlées, y compris celles d’armées adverses qui pourraient capturer le bâtiment après conversion. Si la conversion ne tient pas, elle est refusée sans aucune dépense ; son bouton est désactivé avec la raison dans l’infobulle. Il faut d’abord déployer des troupes ou attendre les groupes en route.

## v0.3.2 — Maison de production et fort défensif

La caserne est supprimée : elle n’existe plus dans les types de bâtiment, les commandes, les dessins, les boutons ou les choix de l’IA. La maison reprend sa progression de production et capacité.

| Statistique | N1 | N2 | N3 | N4 |
| --- | --- | --- | --- | --- |
| Maison : production/s | 0,5 | 1 | 1,5 | 2 |
| Maison : capacité | 20 | 30 | 40 | 50 |
| Maison : défense | 1 | 1 | 1 | 1 |
| Fort : défense | 2 | 2,5 | 3 | 3,5 |
| Fort : capacité | 50 | 65 | 80 | 100 |
| Fort : portée | 240 | 260 | 280 | 300 |

Vitesse commune : 45. Le fort ne produit pas et conserve 2 tirs/s, 1 dégât par tir. Les maisons commencent avec 20 troupes maximum sur les trois cartes ; les neutres respectent aussi leur capacité. Espacement et nombre de bâtiments conservés.

Maison N1 : choix entre améliorer la maison ou construire un fort pour 10 troupes. Le type est ensuite définitif, y compris après capture. Coûts de montée aux niveaux 2/3/4 : 10/20/30 troupes. L’IA utilise ces mêmes règles et ses réserves sont adaptées aux capacités plus basses.

La défense progresse de 0,5 par niveau de fort. Les dégâts partiels sont conservés. S’il ne reste qu’une fraction de troupe attaquante après avoir détruit la garnison, elle est arrondie vers le bas : un survivant entier est nécessaire pour capturer. Exemple : 3 attaquants contre 1 défenseur de défense 2,5 vident le bâtiment sans le capturer ; 4 attaquants laissent 1 survivant et le capturent. Les allocations d’attaque de l’IA sont arrondies au nombre entier supérieur.

Validation : 74 tests réussis. Audit sur les trois cartes : 9 simulations, 1 816 commandes et 17 607 ticks ; 9 replays identiques, sans dépassement de capacité ou effectifs fractionnaires.

## v0.3.3 — Envois libres et surcharge progressive

La capacité ne bloque plus aucun envoi, vers une cible alliée, neutre ou ennemie. Les attaques coordonnées et les ordres à 100 % peuvent dépasser la capacité de destination. Les groupes en route ne réservent plus de places et ne suspendent plus la production avant leur arrivée.

La capacité devient un seuil de production et de surcharge. À capacité ou au-dessus, la production s’arrête. Au-dessus, une garnison appartenant à l’un des deux camps perd progressivement 10 % de son excédent par seconde (premier réglage). Exemple : 40 troupes dans une maison de capacité 20 représentent un excédent de 20 et un débit initial de 2 pertes/s. Le débit diminue avec l’excédent. Une seule troupe excédentaire finit par disparaître après environ 10 secondes. Les pertes ne font jamais passer sous la capacité.

Aucune suppression instantanée à l’arrivée ou à la capture : tous les survivants sont conservés et la surcharge commence à décroître aux ticks suivants. Les armées en trajet ne subissent pas cette attrition. Elle s’applique aussi à l’IA, se fige en pause et s’arrête dès qu’un départ ou une amélioration libère assez de place. Les pertes sont comptabilisées dans les pertes totales et dans `overflowLost`.

La fiche affiche « SURCHARGE », l’excédent et le débit de pertes ; les effectifs en surcharge sont signalés en orange. L’IA peut planifier des attaques supérieures à la capacité ennemie et ses estimations incluent les défenseurs excédentaires. Les transformations ne sont plus bloquées par la capacité.

Validation : 84 tests réussis. Audit : 9 simulations, 2 039 commandes, 19 582 ticks, 9 replays identiques. Tests des attaques de groupe, renforts en surcharge, captures excédentaires, pause, départ, amélioration, faible excédent et estimations de l’IA. Cette règle remplace toutes les anciennes règles de capacité stricte et de réservation décrites dans l’historique.

## v0.3.4 — Statistiques au survol sans texte visible

La fiche affiche uniquement icônes et valeurs : bouclier pour défense, + cerclé pour production, chevrons pour vitesse, groupe de soldats pour capacité. Le nom/type/camp du bâtiment n’est plus visible dans cette fiche. Les libellés restent disponibles aux lecteurs d’écran. La portée et les dégâts/s du fort utilisent une cible et un éclair ; la surcharge utilise un triangle d’alerte, l’excédent et le débit de pertes. Aucun message rédigé n’est visible dans la fiche.

Le cadre passe de 184 à 156 px et conserve deux lignes principales. Les commandes flottantes et le reste de l’interface sont conservés. Validation : 84 tests réussis et vérification navigateur des fiches maison et fort.

## v0.4.0 — Silo et missiles

Une maison N1 non améliorée peut devenir un silo pour 10 troupes, avec verrouillage définitif comme le fort. Le silo dispose de trois niveaux, ne produit aucune troupe et demande des renforts pour financer ses missiles. Défense 1 et vitesse d’envoi 45.

| Niveau | Capacité | Coût pour atteindre ce niveau | Nouveau missile | Coût du missile | Fabrication |
| --- | --- | --- | --- | --- | --- |
| 1 | 50 | Transformation : 10 | Balistique | 25 | 10 s |
| 2 | 75 | 20 | Poison | 30 | 10 s |
| 3 | 100 | 40 | EMP | 40 | 15 s |

Les missiles précédents restent disponibles aux niveaux supérieurs. Un seul missile stocké ou en fabrication par silo. Les coûts sont prélevés au début de fabrication sur la garnison, suivis dans les dépenses. La pause arrête les compteurs. Les changements de type et niveaux restent conservés après capture.

Au survol : cliquer sur une icône de missile pour fabriquer, suivre les secondes restantes, puis cliquer sur le bouton marqué ✓ et cliquer sur la cible. Échap annule uniquement la visée, sans perdre le missile prêt. Les cibles sont des bâtiments adverses ; l’EMP peut aussi capturer un neutre. Portée : toute la carte. Le vol balistique animé prend 1,5 seconde après lancement. Les missiles ne sont pas interceptés par les troupes ni par les forts.

- Balistique : explosion normale, propriétaire neutre, garnison conservée. Type et niveau conservés.
- Poison : −1 troupe toutes les 2 secondes, indéfiniment, sans effet cumulatif. Production inchangée, propriétaire inchangé, effectif jamais négatif. Le halo vert et l’icône −1/2s signalent le poison. La neutralisation seule ne le soigne pas ; une conquête par une faction, avec troupes ou EMP, le supprime.
- EMP : capture au camp du tireur, garnison/type/niveau conservés. Pas de dégâts sur les troupes en chemin.

Toute capture ou neutralisation d’un silo annule sa fabrication sans remboursement. Le missile stocké est également détruit (règle initiale). Un missile déjà lancé poursuit sa mission au nom du camp qui l’a tiré. Si la cible devient alliée avant l’impact, elle n’est pas affectée. La victoire attend la résolution des missiles encore en vol, car une EMP peut encore capturer un bâtiment.

L’IA peut construire des silos en Normal/Difficile à partir de 45 secondes avec au moins trois bâtiments et une maison disponible ; elle peut utiliser les silos qu’elle possède, en payant les mêmes coûts et en respectant fabrication, stock et niveaux. Les cadences de décision restent inchangées.

Validation : tests de chaque coût/délai, déblocages, pause, annulation de production à la capture, conservation des garnisons, poison permanent, neutralisation puis conquête, EMP, vol indépendant du silo, victoire retardée, boutons, ciblage et replays exacts.

Bilan de validation v0.4.0 : 101 tests réussis. Audit : 9 simulations sur trois cartes, 3 020 commandes et 28 082 ticks, avec 9 replays identiques. Vérification navigateur de la transformation en silo, des commandes disponibles/verrouillées, du paiement, du compteur de fabrication, du bouton prêt, du ciblage et de la neutralisation.

## v0.4.1 — Tirs des forts et corrections

Les forts tirent un projectile lumineux animé, avec courte traînée aux couleurs du camp, flash au bord du bâtiment et étincelles à l’impact. La courte trajectoire utilise la position et la vitesse enregistrées au tir ; l’effet reste visible même si le groupe cible disparaît. Les dégâts de simulation restent instantanés, 1 par tir, à 2 tirs/s : l’animation ne peut ni ajouter de dégâts ni modifier les collisions. Les effets sont regroupés dans `src/rendering/CombatEffects.js`, avec isolation de l’opacité Canvas pour éviter une fuite entre effets. Les impacts balistiques des missiles gagnent aussi une onde de poussière et des particules.

Deux bugs reproduits puis corrigés :

- Un événement de relâchement du bouton secondaire pouvait terminer un glisser commencé avec le bouton principal. Seul le relâchement principal termine désormais l’ordre.
- Un missile disparaissait sans impact visuel si sa cible était devenue alliée pendant son vol. L’explosion visuelle reste maintenant visible, atténuée et sans appliquer l’effet du missile au bâtiment allié.

Validation : 106 tests réussis, notamment régressions des deux bugs, déplacement du projectile, positions finies, conservation des événements, restauration Canvas et absence de double dégât sur une cible détruite. Audit : 9 simulations, 3 020 commandes et 28 082 ticks, 9 replays identiques. Rendu et démarrage vérifiés dans le navigateur.

## v0.4.2 — Icônes des missiles

Les trois boutons de missile utilisent une silhouette pleine de 32 px, avec pointe et ailerons, inspirée de la référence fournie. Balistique rouge, poison vert, EMP bleu. Les coûts, états désactivés, compteurs et indicateurs de missile prêt sont conservés.

## v0.4.3 — Sons et retours visuels

- Effets sonores synthétisés localement pour les envois, captures, neutralisations, tirs de fort, lancements/impacts de missile et améliorations. Activation après un geste utilisateur, sans fichier audio externe.
- Réglages Audio dans la colonne latérale : volume et mode muet, mémorisés dans le navigateur si le stockage est disponible. La pause et une nouvelle partie arrêtent les sons actifs. Aucun son manqué n’est rejoué.
- Captures : double onde de couleur, particules et légère impulsion du bâtiment. Les préférences système de réduction des animations sont respectées.
- Anneau de fabrication coloré autour du bouton missile, compteur en secondes et coche à la fin. La progression suit la simulation et se fige en pause.
- Correction de la collecte des événements : les commandes exécutées entre deux pas de simulation conservent leurs retours visuels et sonores, sans doublon. Aucun changement des dégâts, coûts, délais ou règles de conquête.

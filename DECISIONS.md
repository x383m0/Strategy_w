# Décisions — Jelly Wars

## Confirmées par Anthony

- Jeu de stratégie de conquête inspiré des mécaniques de Jelly Go!, identité graphique propre et Flat Design.
- JavaScript, HTML5 Canvas, architecture modulaire, solo sans serveur et compatible GitHub Pages.
- L’IA respecte les mêmes règles et la même production que le joueur.
- Les groupes opposés combattent aussi lorsqu’ils se croisent en chemin.
- Victoire : éliminer tous les bâtiments et toutes les troupes adverses. Une armée sans bâtiment continue à jouer.
- Glisser d’un bâtiment à une cible. Envoi de 50 % par défaut, proportion réglable.
- Multijoueur en dernière phase uniquement ; préparer les commandes et l’état dès le prototype.
- Consulter le propriétaire avant d’introduire de nouvelles mécaniques importantes.

## Retour joueur — v0.1.1

- Anthony demande davantage de temps pour réagir : augmenter les distances entre bâtiments et réduire la vitesse des troupes.
- Réglage de départ : distances centre à centre +40 % sur les trois cartes, vitesse 68 au lieu de 105 unités/s (−35 % environ). Les trajets durent environ 2,3 fois plus longtemps, davantage sur les liaisons les plus courtes.
- Appliquer les mêmes distances et vitesses aux deux camps. Production inchangée.
- Hébergement principal : GitHub Pages. Fournir les mises à jour en ZIP ; ne pas republier sur Sites par défaut.

## Paramètres du prototype, à tester et ajuster

Ces valeurs sont des réglages provisoires, pas de nouvelles mécaniques définitivement approuvées.

- Un seul type de bâtiment ; +1 unité/seconde lorsqu’il appartient à un camp, aucune production neutre.
- Combats déterministes à force égale : 1 unité élimine 1 unité. En cas d’égalité exacte, le bâtiment reste à son propriétaire avec 0 unité.
- Les survivants d’un combat en chemin conservent leur destination. Rayon d’engagement entre groupes : 14 unités de carte.
- Les troupes sont regroupées en armées ; les points affichés sont un symbole du groupe, le nombre indique l’effectif réel.
- Trois terrains symétriques fixes, mêmes effectifs et production de départ pour les deux camps.
- Sélection multiple avec Maj + clic ou rectangle ; glisser depuis un bâtiment sélectionné donne un ordre commun.
- Proportion réglable de 10 à 100 %, arrondie à l’entier inférieur par bâtiment ; aucun départ inférieur à 1 unité.
- Simulation à 30 ticks/seconde ; pause automatique lorsque l’onglet est masqué.
- Facile, Normal et Difficile sont des réglages provisoires de cadence, coordination et défense ; leur difficulté réelle reste à mesurer.
- Le bouton Nouvelle partie abandonne la partie courante et ouvre les choix de départ.

## À discuter avant les phases suivantes

- Types de bâtiments, améliorations, obstacles ou autres nouvelles mécaniques : rien de tout cela n’est implémenté.
- Profondeur de planification, critères de force de l’Expert et protocole d’évaluation.
- Nouvelles tailles de cartes et éventuels réglages de parties.
- Choix du réseau, autorité hôte/serveur, signalisation et relais, après stabilisation du solo.

## Retour joueur — v0.1.2

Anthony demande de réduire la difficulté de Facile et Normal pour laisser plus de temps entre les actions et de ralentir encore les troupes. Réglages : Facile évalue toutes les 6 s avec un départ à 8 s ; Normal toutes les 3 s avec un départ à 5 s. Cadence Difficile conservée. Vitesse commune abaissée de 68 à 44 unités/s. Production et espacement inchangés. Valeurs à équilibrer avec le retour du joueur.

## Retour joueur — v0.1.3

Afficher un petit message indiquant la version dans le menu de lancement.

## Statistiques des bâtiments — en cours

Anthony fixe la vitesse par défaut à 45 unités/s (au lieu de 44). Cette vitesse est appliquée aux deux camps. Statistiques demandées : défense 1, production 1/s, vitesse 45, capacité 50 et affichage au survol. Le comportement des renforts à capacité reste à confirmer avant la finalisation de ce système.

## Retour joueur — v0.1.4

Anthony annule la réduction des distances : conserver le facteur d’espacement 1,4. Garder 9 bâtiments sur les trois cartes actuelles, nombre variable selon les futures cartes. Agrandir seulement les symboles des troupes (+70 %) et leur effectif pour améliorer leur visibilité, sans agrandir la zone de collision. Vitesse commune : 45 unités/s.

## Retour joueur — v0.1.5

Corriger le double-clic pour envoyer toutes les troupes disponibles des bâtiments sélectionnés vers la cible, y compris les troupes restantes après un glisser-déposer. Conserver le réglage de proportion pour les glisser-déposer. Le réglage pendant le glisser reste une question séparée non confirmée.

## Retour joueur — v0.1.6

Agrandir les bâtiments d’environ 20 %. Rayon de 37,2 au lieu de 31 ; rendu et interaction cohérents avec cette taille. Positions, nombre de bâtiments et vitesse inchangés.

## Retour joueur — v0.1.7 (statistiques finalisées)

La capacité est une limite stricte, renforts compris : rien ne peut être envoyé si l’ordre dépasse la place disponible. Valeurs de base confirmées : défense 1, production 1/s, vitesse 45, capacité 50. Fiche de statistiques au survol.

Implémentation : réservation des places pour les groupes en route, production suspendue à la capacité ou lorsque les places libres sont réservées. Ordre trop grand refusé atomiquement, sans perte et sans envoi partiel. Pour les attaques, le total en route par camp est également limité à la capacité du bâtiment pour éviter tout débordement après capture. Aucun surplus n’est supprimé. Dégâts de défense 2 conservés entre vagues successives ; les combats en chemin restent à 1 pour 1. La validation est commune au joueur et à l’IA.

La question du comportement à capacité est résolue. L’édition de ces statistiques par le joueur, les améliorations et les nouveaux types de bâtiments ne sont pas implémentés.

## Prochaine étape — types de bâtiments

Anthony choisit les trois premiers types présentés : Maison, Caserne et Fort. Les laboratoires sont reportés. Les maisons pourront être spécialisées ; les casernes produiront les troupes et les forts tireront automatiquement sur les groupes ennemis à portée. Coût de transformation et statistiques initiales à préciser avant implémentation. Aucun système d’amélioration par niveaux n’est confirmé pour cette étape.

## v0.2.0 — Types validés et implémentés

Anthony valide Maison, Caserne et Fort et le coût de transformation de 10 troupes. Statistiques validées : Maison défense 1 / production 1/s / vitesse 45 / capacité 50 ; Caserne 1 / 2/s / 45 / 50 ; Fort 2 / 0/s / 45 / 50.

Transformation d’une maison en une spécialisation, immédiate et définitive pour cette première version. Le type est conservé après capture ; pas de conversion entre caserne et fort. Toutes les cartes commencent avec des maisons. La même commande validée est utilisée par l’IA et le joueur. Les 10 troupes sont une dépense, suivie séparément des pertes.

Réglages de tir provisoires, annoncés pendant l’implémentation et à équilibrer : portée 240 unités de carte, 1 dégât/s sur le groupe ennemi le plus proche, au moins 1 troupe en garnison pour tirer, aucun coût de munition. Un fort vide ou neutre ne tire pas. Cadence et choix de cible déterministes. Aucune amélioration par niveaux ni laboratoire ajouté.

## Retour joueur — v0.2.1

Rendre les statistiques au survol visibles, retirer le panneau Déploiement à droite, déplacer la spécialisation en petites icônes au survol d’une maison alliée. Le glisser conserve 50 % et le double-clic 100 %. Retirer aussi le panneau de spécialisation sous le terrain remplacé par ces icônes.

Remplacer les flèches et points des armées par un cercle contenant leur effectif, dimensionné selon le nombre de troupes. Conserver les formes des bâtiments (maison ronde, caserne carrée, fort hexagonal). Le rayon des bulles est purement visuel et ne modifie pas la zone de collision.

Correction du survol : fiche mise à jour directement sur les mouvements de pointeur, délai de sortie renouvelé au moment de quitter le canvas, zone de passage entre bâtiment et fiche, maintien au pointeur ou au focus. Ces garanties permettent de cliquer les icônes après un long survol sans fermeture prématurée. Ajouter des paramètres de version aux ressources d’interface modifiées pour éviter un mélange de fichiers en cache sur GitHub Pages.

## Commandes et caserne — v0.2.5

Instruction actuelle : abandonner le double-clic. Maj + glisser envoie 100 %, glisser normal 50 %, Maj + clic reste la sélection multiple. Caserne : production 1,5/s, capacité 80. Les anciennes décisions de double-clic et de caserne à 2/s sont remplacées.

Fort : cadence portée à 2 tirs/s ; dégâts par tir (1) et portée (240) conservés.

## Quatre niveaux et type définitif — v0.3.0

Confirmé par l’utilisateur : style contemporain de la seconde maquette ; quatre niveaux pour maison/caserne/fort ; impossibilité de changer de type après amélioration ou construction d’un autre type. Interprétation appliquée : seule la maison N1 non améliorée peut choisir sa spécialisation. Capture conserve type, niveau et verrouillage.

Provisoire : coûts 10/20/30 pour les niveaux 2/3/4 et progression des statistiques détaillée dans README. Les statistiques N1, vitesse 45 et fort 2 tirs/s sont conservées.

## Casernes — v0.3.1

Capacités confirmées après correction : 20/30/40/50 pour N1/N2/N3/N4. Production retenue : 0,5/1/1,5/2 par seconde, suivant le maximum de 2/s et +0,5 par niveau demandés ; l’exemple initial « N2 2/s » est interprété comme une faute de frappe. La conversion vers une capacité inférieure est refusée si garnison après coût ou réservations ne tiennent pas, sans perte de troupes.

## Suppression de la caserne et défense des forts — v0.3.2

Demandé : supprimer la caserne et donner ses statistiques à la maison : production 0,5/1/1,5/2, capacité 20/30/40/50. Fort : défense de base 2, +0,5 par amélioration, soit 2/2,5/3/3,5. Les autres statistiques du fort sont conservées. Les garnisons initiales sont bornées à la capacité 20. Les survivants attaquants sont arrondis vers le bas pour conserver des troupes entières.

## Envois libres et surcharge — v0.3.3

Demandé : aucune limite de capacité sur les envois, même groupés et dirigés vers un ennemi. Dépassement autorisé sur les alliés avec pertes proportionnelles à l’excédent. Implémenté pour les deux camps et après capture : production arrêtée à capacité, attrition de l’excédent à 10 %/s (taux provisoire). Pas de pertes instantanées à l’arrivée, pas de réservations. Les troupes restent entières via un accumulateur à pas fixe. Les anciennes règles de refus pour capacité et de réservation sont remplacées.

## Silo — v0.4.0

Confirmé par l’utilisateur : maison N1 → silo pour 10 troupes ; garnison conservée par neutralisation et EMP ; fabrication puis choix de cible. Silo : trois niveaux, production 0, capacités 50/75/100, améliorations 20/40. Balistique : 25, 10 s, rend neutre. Poison : 30, 10 s, débloqué N2, −1 troupe/2 s jusqu’à capture. EMP : 40, 15 s, débloquée N3, capture au tireur. Annulation de fabrication si silo conquis.

Première implémentation : un seul missile stocké par silo, portée carte entière, coûts en garnison, vol balistique 1,5 s, pas d’interception. Stock prêt détruit aussi lors du changement de propriétaire, sans remboursement de fabrication. Poison non cumulatif, conservé lors de neutralisation seule, guéri par conquête. Un bâtiment devenu allié avant impact n’est pas affecté. Les missiles en vol maintiennent leur camp même après capture du lanceur et empêchent une victoire prématurée.

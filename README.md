# Préparation du multijoueur

Aucun réseau n’est encore implémenté.

`Game.command({type:'send', player, sources, target, fraction})` centralise la validation et est utilisé par le joueur comme par l’IA. Les identifiants de bâtiments et d’armées sont stables. L’état est sérialisable par `snapshot(state)` et contient le tick et un journal des commandes acceptées.

La simulation est indépendante du Canvas et avance à pas fixe avec `Game.step()`. Les combats n’utilisent pas de hasard. Les effets et les temps de performance restent hors de l’état stratégique.

Pour le futur réseau, l’hôte ou le serveur devra lier l’identité authentifiée à `player`, attribuer un ordre aux commandes au même tick, valider leur cadence et diffuser des snapshots avec numéros de séquence. Le champ `player` envoyé par un client ne doit jamais être considéré comme une preuve d’identité. Reconnexion et correction des divergences restent à construire.

GitHub Pages sert les fichiers statiques ; un service externe sera requis pour la signalisation ou l’autorité réseau, selon le choix validé avec Anthony.

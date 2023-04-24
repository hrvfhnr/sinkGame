# GameDesign :

## Contrôles : 
- la souris déplace automatiquement l'éponge (on ne peut pas la poser)
- clic maintenu : on frotte (éponge "compressée' + mousse)
- appui sur la touche espace pour rincer et vérifier que l'assiette est propre.
- on affiche le pourcentage de propreté: 
    - 100% : ça passe, assiette suivante
    - sinon : il faut continuer à frotter

## Scoring :
- faire le meilleur temps pour laver x assiettes
- le rincage + check prend un peu de temps avec les anims => gérer la prise de risque
- on affiche le temps qui défile en permanence.

### Lavage : 
- canvasTexture dans Phaser 3 ? 
- on dessine les tâches sur plusieurs layers. 
- chaque layer est + ou moins difficile à nettoyer : 
    - on retire x% d'alpha à chaque fois : 30% / 10% / 2% 
    - le layer du dessous n'est pas nettoyé tant qu'il en reste un au dessus.

### Trucs utiles : 
- bouton start / restart
- random seedé 



### TODO : 
X github pages 
X rinse & check : 
    X anim de plouf
    X remontée avec le pourcentage de complétion
        X fail
        X success
X game over avec résultat final
    => particleEmitter de mousse sur tout l'écran ? 
- réactiver le décompte de départ

BONUS: 
X sparkles sur le completion success
- mousse quand on gratte ? 
    X cale la mousse sur un layer sous l'éponge
    X ajouter une deadZone inside avec un geom.Circle
    - au rinse, on fait aussi descendre le foamLayer avec l'assiette
    X start/stopFollow sur le game.setStep
        X couper sur la sortie de PLAY
        X reprendre sur PLAY si pointer.isDown
X mousse qui dépasse de l'évier sur le yoyo de rinse ?

- anim d'eau dans l'evier
- robinet qui goutte
X sons



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
- random seedé => `npm install --save rand-seed`
- envoi du score dans intra machin ? 
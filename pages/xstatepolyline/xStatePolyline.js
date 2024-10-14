import Konva from "konva";
import { createMachine, interpret } from "xstate";


const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

const MAX_POINTS = 10;
let polyline // La polyline en cours de construction;

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFkB5AVQGUBRAYWwEkWBpAbQAYAuohSpYuAC65U+YSAAeiAOwBGAMxEATKsUAWAJw7VevgDYdhgDQhMiZYoAcRAKz3Vbp6r46+y5ffsAvgFWaFh4hEQAYuwASgwAKgAKNOwAcvHU9My0AGpM-EJIIGhiktKyCgj2KkQmGvr2BhpOiibaVjYI9TpEbn1OTsb2g35BIRg4BMTRcUkp6ZmMrBzcBbIlElIyRZUq6lq6Bkam5qodiDomJkR8far2dar1TjqKY8UT4cQ08QASTDFkmkMrQlrl8oJ1qJNuUdrZfEQdPZlM89CjGnw9PZzghtI4+HxXNodBpmvZzO9QpMIj9-oD5hkAEIAQW4DESrIhhREpS2FQuGhuBOFIuFOhxGmRzhcbh0yluqichNUlM+UyItIBQIWLLZHJY+WU3I+vNhoEqisFhkOg0UPhMijcOKegs8RJMejadWqqrC6s19OBFCYDBYzMSXKhpu25sQlsRxL0tvtjrO1lsikUREUSoJyj0dodwx0vup3z+WoZwfSALWRQ2ZRj8jjTitieTygdTvTVWUmj0A6xJicynM+g0pa+GorgYWoOYbE4vEh9ehjf5CEdiNM9STTx8XicOL8TiI8qJfAccrsE-e+FQEDgUL9hCjMKblQAtC4z-dCfoWj0VRhxxT9rlFQYNAJAxFCAyd1VIcg33XOEEBMPhBTaXRGicOornsDRjyAogC1zbwURzckTHgiIZgSbV4mQvlUOqPRemReplEGYwvD0Z0dFPBw+kaeVMQ0TMaPLOkGKYs1mwQT95V-ex-yTWDgP0PiexeLN82aHNDBUq5qKCAIgA */
        context: {},
        id: "polyLine",
        initial: "idle",
        states: {
          idle: {
            on: {
              MOUSECLICK: {
                target: "FIRSTPOINT",
                actions: "createLine",
                
              },
            },
          },
          "FIRSTPOINT": {
            on: {
              MOUSEMOVE: {
                target: "FIRSTPOINT",
                actions: "setLastPoint",
              },
              MOUSECLICK: {
                target: "OTHERPOINT",
                actions:  "addPoint",
                },
              },
              ESCAPE: {
                target: "idle",
                actions:  "abandon",
                },
              },
        
          "OTHERPOINT": {
            on: {
              MOUSEMOVE: {
                target: "OTHERPOINT",
                actions:  "setLastPoint",
              },
              BACKSPACE: [
                {
                  target: "OTHERPOINT",
                  actions: 
                    "removeLastPoint",
                 
                  guard: 
                   "plusDeDeuxPoints",
                
                },
                {
                  target: "FIRSTPOINT",
                  actions: 
                  "removeLastPoint",
                  
                },
              ],
              ESCAPE: {
                target: "idle",
                actions: 
                 "abandon",
       
              },
              ENTER: {
                target: "idle",
                actions: 
                 "saveLine",
               
              },
              MOUSECLICK: {
                target: "OTHERPOINT",
                actions: 
                   "addPoint",
               
                guard: 
                 "pasPlein",
              
              },
            },
          },
        },
    
    },{
        actions: {
            // Créer une nouvelle polyline
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                layer.add(polyline);
            },
            // Mettre à jour le dernier point (provisoire) de la polyline
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2); // Remove the last point
                polyline.points(newPoints.concat([pos.x, pos.y]));
                layer.batchDraw();
            },
            // Enregistrer la polyline
            saveLine: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                // Le dernier point(provisoire) ne fait pas partie de la polyline
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                layer.batchDraw();
            },
            // Ajouter un point à la polyline
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const newPoints = [...currentPoints, pos.x, pos.y]; // Add the new point to the array
                polyline.points(newPoints); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
            // Abandonner le tracé de la polyline
            abandon: (context, event) => {
                // Supprimer la variable polyline :
                
            },
            // Supprimer le dernier point de la polyline
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size); // Le point provisoire
                const oldPoints = currentPoints.slice(0, size - 4); // On enlève le dernier point enregistré
                polyline.points(oldPoints.concat(provisoire)); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
        },
        guards: {
            // On peut encore ajouter un point
            pasPlein: (context, event) => {
                // Retourner vrai si la polyline a moins de 10 points
                // attention : dans le tableau de points, chaque point est représenté par 2 valeurs (coordonnées x et y)
                
            },
            // On peut enlever un point
            plusDeDeuxPoints: (context, event) => {
                // Deux coordonnées pour chaque point, plus le point provisoire
                return polyline.points().length > 6;
            },
        },
    }
);

// On démarre la machine
const polylineService = interpret(polylineMachine)
    .onTransition((state) => {
        console.log("Current state:", state.value);
    })
    .start();
// On envoie les événements à la machine
stage.on("click", () => {
    polylineService.send("MOUSECLICK");
});

stage.on("mousemove", () => {
    polylineService.send("MOUSEMOVE");
});

// Envoi des touches clavier à la machine
window.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    // Enverra "a", "b", "c", "Escape", "Backspace", "Enter"... à la machine
    polylineService.send(event.key);
});

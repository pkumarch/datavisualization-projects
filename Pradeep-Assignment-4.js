function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill("yellow");
  circle(200, 200, 190);
  //Eyes
  fill("white");
  ellipse(160, 165, 20, 10);
  ellipse(240, 165, 20, 10);
  fill("black");
  circle(160, 165, 8);
  circle(240, 165, 8);
  //Mouth
  fill(255);
  arc(200, 220, 90, 70, 0, PI, CHORD);

  fill("red");
  //Tilak on forehead
  bezier(200, 120, 185, 160, 215, 160, 200, 120);
  
  //Mahastrian Feta
  quad(200, 72, 242, 90, 110, 160, 100, 85);
  quad(242, 90, 300, 110, 295, 168, 209, 105);
  quad(100, 85, 96, 210, 85, 215);
  quad(100, 85, 85, 215, 75, 220);
  quad(100, 85, 75, 220, 70, 225);
}

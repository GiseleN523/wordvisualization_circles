require.config({  //add configurations; in this case, specifying the link to d3 here so we don't need it every time we want to use d3
    paths: {
      'd3': "https://d3js.org/d3.v7.min"
    }
  });
  
requirejs(['@giselen/wordvisualization_circles@1.0.0'], function(app) //requires app.js
{
    let words=[
        {word: "hi", weight: 9},
        {word: "hello", weight: 6},
        {word: "world", weight: 3},
        {word: "howdy", weight: 1},
        {word: "earth", weight: 2},
        {word: "word", weight: 4},
        {word: "cloud", weight: 14},
        {word: "visual", weight: 11}
        ];

    app.setSource(words); //pass words to app to use as its source
    let cloud = creator.generateCloud(); //generate a cloud based on the source that has been set
    document.getElementById("div1").append(cloud); //set div1's contents to the results of app.js
});
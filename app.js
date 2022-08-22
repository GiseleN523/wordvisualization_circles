define(['https://cdn.jsdelivr.net/gh/jasondavies/d3-cloud@master/build/d3.layout.cloud.js', 'd3'], function(d3cloud, d3)
{
    const width = 1200; //set constant variables to avoid 'magic numbers'
    const height = 800;
    const maxRadius = 170;
    const minRadius = 20;
    const minFontSize = 12;
    const maxFontSize = 87;

    let source;
    let radiusScale;
    let fontSizeScale;
    let colorScale;

    creator = { //create object that will be returned at the end (in this case, to main.js)
        setSource: function(s) //ability to set the source that the cloud will be generated based on - takes array of objects of the {word: , weight: } form
        {
            source = s;

            radiusScale = d3.scaleLinear() //now that we have the source and know the max weight it contains, define radiusScale, fontSizeScale, and colorScale
                .domain([1, d3.max(source, d => d.weight)])
                .range([minRadius, maxRadius]);

            fontSizeScale = d3.scaleLinear()
                .domain([1, d3.max(source, d => d.weight)])
                .range([minFontSize, maxFontSize])

            colorScale = d3.scaleLinear()
                .domain([1, d3.max(source, d => d.weight)])
                .range(['#e6e6ff', '#0000cc'])
                .interpolate(d3.interpolateLab);
        },
        generateCloud: function()
        {
            if(source === undefined) //only proceed if source has been defined
            {
                return;
            }

            let svg = d3.create('svg') //create svg that will be added to and then returned at the end
                .attr('height', height)
                .attr('width', width);


            source.forEach(function(item)    //randomly generate x and y coordinates ahead of time that both the circles and texts will use
            {
                let collision = true;
                let r1 = radiusScale(item.weight);
                let it = 0;
                while(collision && it < 100) //check for collisions, and, while there are any, pick new x and y (if there have been 100 iterations, give up)
                {
                    it++;
                    item.x = r1 + (Math.random()*(width-r1*2)); //pick random x and y, ensuring circle will be within bounds of svg
                    item.y = r1 + (Math.random()*(height-r1*2));
                    collision = false;
                    for(let i = 0; i<source.indexOf(item); i++) //check each previously chosen set of coordinates and make sure a circle with those coordinates won't collide with this one
                    {
                        let item2 = source[i];
                        let r2 = radiusScale(item2.weight);
                        if(((item2.x - r2) > (item.x - r1) && (item2.x - r2) < (item.x + r1)) || ((item.x - r1) > (item2.x - r2) && (item.x - r1) < (item2.x + r2)))
                        {
                            if(((item2.y - r2) > (item.y - r1) && (item2.y - r2) < (item.y + r1)) || ((item.y - r1) > (item2.y - r2) && (item.y - r1) < (item2.y + r2)))
                            {
                                collision = true;
                                break;
                            }
                        }
                    }
                }
            });

            svg.selectAll('circle') //create circles based on the source data and previously determined coordinates
            .data(source)
            .join('circle')
            .attr('fill', d =>  colorScale(d.weight))
            .attr('r', d => radiusScale(d.weight))
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

            svg.selectAll('text') //create text based on the source data and previously determined coordinates
            .data(source)
            .join('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('font-size', d => fontSizeScale(d.weight))
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(d => d.word)

            return svg.node();
        }
    }

    return creator; //return this object so that its dependents can access methods and variables

    function parseText(textStr, stopWords, stopWordPref) 
    {
        console.log("start parse text"); //analyzing speed
    
        let words = textStr.split('\n').join(' ').split('\r').join(' ').split(' ');
        let cleanWords = words.map(word => word.replace(/[;:()“”."!?,—]/g, "")) //dashes should convert to space not empty str
        cleanWords = cleanWords.map(word => word.replace(/[-_–]/g, " "))
        let wordsDict = {}
        cleanWords.forEach(function(c) {
          if(c.length > 0)
          {
            if(c in wordsDict) {
              wordsDict[c]++
            }
            else {
              wordsDict[c] = 1
            }
          }
        })
        let textArr = Object.keys(wordsDict)
        let freqArr = Object.values(wordsDict)
        let wordsFreq = []
        for(let i = 0; i < Object.keys(wordsDict).length; i++){
          let thisWord = {text: textArr[i], frequency: freqArr[i], semGroup: 1} //call function here that determines semantic group
          wordsFreq.push(thisWord)
        }
        
        console.log("words added start cleaning"); //analyzing speed
    
        //is this n^2?
        if(stopWordPref)
        {
            wordsFreq = wordsFreq.filter(x => stopWords.findIndex(el => {return el.toUpperCase() === x.text.toUpperCase()}) === -1);
        }
    
        //is this n^2?
        wordsFreq.forEach(function(wordObj) {
          findMatch = wordsFreq.map(y => y.text).indexOf(wordObj.text.toLowerCase())
          if (findMatch !== -1 && wordsFreq[findMatch] !== wordObj) {
            if(wordObj.frequency > wordsFreq[findMatch].frequency) {
              wordObj.frequency += wordsFreq[findMatch].frequency
              wordsFreq.splice(findMatch, 1)
            }
            else if (wordObj.frequency <= wordsFreq[findMatch].frequency) {
              wordsFreq[findMatch].frequency += wordObj.frequency
              wordsFreq.splice(wordsFreq.indexOf(wordObj), 1)
            }
          } 
        })
        return wordsFreq.sort((e, f) => (e.frequency <= f.frequency) ? 1 : -1); //sort in descending order
    }

});
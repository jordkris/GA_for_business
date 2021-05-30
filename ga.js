/*jshint esversion: 6 */
var item_number = [];
var area = [];
var gain = [];
var threshold;
var item_count;
var myChart = null;

function move(start, finish) {
  var percentage = Math.floor(100*start/finish);
  var elem = document.getElementById("myBar");
  elem.style.width = percentage + "%";
  document.getElementById('myBar').innerHTML = percentage + '%';
}

function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function printed_value(best_pop, best_result, numgenerations) {
  var types = '';
  for(var k=1; k<=best_pop.length; k++) {
    if(best_pop[k-1] == '1') {
      types += k+', ';
    }
    console.log('types : '+types);
  }
  var temp = types.toString();
  if(types.length % 3 == 0) {
    types = types.replace(temp.substr(-3,3),'and '+temp.substr(-3,1)); 
  } else {
    types = types.replace(temp.substr(-4,4),'and '+temp.substr(-4,2)); 
  }
  console.log('test : '+temp+' '+types);
  types += ' with a total IDR '+best_result[numgenerations-1];
  types = 'The type of boarding house that maximizes profits : '+types;
  printed(types);
  return types;
}

function printed(out) {
  document.getElementById('output').innerHTML += '<code style="color: white;">'+out+'</code><br />';
}     

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

function creategraph(best, mean, worst, num_gen) {
  if(myChart != null) {
    myChart.destroy();
  }
    var criteria = ['Best','Mean','Worst'];
  var labels = [];
  for(var a=0;a<num_gen;a++) {
    labels.push(a);
  }
  var dataplot = [];
  for(var b=0; b<criteria.length; b++) {
    dataplot.push([]);
  }
  var r1, r2, r3, rgb1, rgb2;
  var out = [];
  for(var i=0; i<criteria.length; i++) {
    r1 = random_int(0,255);
    r2 = random_int(0,255);
    r3 = random_int(0,255);
    rgb1 = 'rgba('+r1.toString()+','+r2.toString()+','+r3.toString()+',0.2)';
    rgb2 = 'rgba('+r1.toString()+','+r2.toString()+','+r3.toString()+',0.7)';
    out.push({});
    out[i].label = criteria[i];
    out[i].data = dataplot[i];
        if(i==0) {
            out[i].data = best;
        } else if(i==1) {
            out[i].data = mean;
        } else if(i==2) {
            out[i].data = worst;
        }
    out[i].backgroundColor = [rgb1];
    out[i].borderColor = [rgb2];
    out[i].borderWidth = 2;
  }

    //line
  var ctxL = document.getElementById('chart_ga').getContext('2d');
  myChart = new Chart(ctxL, {
    type: 'line',
    data: {
      labels: labels,
      datasets: out
    },
    options: {
      scales: {
          yAxes: [{
              position: "left",
              ticks: {
                  beginAtZero: true
              },
              scaleLabel: {
                  display: true,
                  labelString: 'Total Profit (IDR)'
              },
              
          }],
          xAxes: [{
              position: "bottom",
              ticks: {
                  beginAtZero: true
              },
              scaleLabel: {
                  display: true,
                  labelString: 'N-th Generation'
              },
              
          }]
      },
      responsive: true,
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10,
            callbacks: {
              label: function(tooltipItem, chart) {
                var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                return datasetLabel + ' : IDR ' + number_format(tooltipItem.yLabel);
              }
            }
          }
    },
  });
}

function cal_fitness(offspring, area, gain){
  var switch1 = [];
  for(var i=0;i<offspring.length;i++){
    switch1.push(parseInt(offspring[i]));
  }
  var fitness = 0;
  var sum_area = 0;
  for (var j=0;j<switch1.length;j++){
    sum_area += switch1[j]*area[j];
    fitness += switch1[j]*gain[j];
  }
  if (sum_area > threshold) {
    fitness = 0;
  }
  return fitness;
}

function flip(prob){
    if (Math.random() < prob){
        return true;
    }
    return false;
}

function initialization(popsize, item_count, area, gain){
    var population = [];
    var fitnesses = [];
    var sol;
    for(var i=0; i<popsize; i++){
      sol = '';
      for(var j=0; j<item_count; j++){
        if(flip(0.5)) {
          sol += '1';
        } else {
          sol += '0';
        }
      }
      population.push(sol);
    }
    for(var k=0;k<population.length;k++) {
      fitnesses.push(cal_fitness(population[k],area,gain));
    }
    return {population: population, fitnesses: fitnesses};
}

function select(fitnesses){
    var total = fitnesses.reduce((a, b) => a + b, 0);
    var r = random_int(0, total);
    var acc = 0;
    for (var i=0; i<fitnesses.length; i++) {
        acc += fitnesses[i];
        if (acc >= r) {
            return i;
        }
    }
}

function crossover(p1, p2, prob) {
    if (flip(prob) == false) {
      var p = [];
      p.push(p1);
      p.push(p2);
        return {c: p, x: 0};
    }
    var x = random_int(0,p1.length-1);
    var c1 = p1.substr(0,x) + p2.substr(x,p2.length-x);
    var c2 = p2.substr(0,x) + p1.substr(x,p1.length-x);
    var c = [];
    c.push(c1);
    c.push(c2);
    return {c: c, x: x};
}

function mut(i){
  if(i=='0') {
    return '1';
  } else {
    return '0';
  }
}

function mutation(s, prob){
    var mutated = '';
    for (var i=0; i<s.length;i++){
        if (flip(prob)) {
            mutated += mut(s[i]);
        }
        else{
            mutated += s[i];
        }
    }
    return mutated;
}

function generation(population, fitnesses, pcrossover, pmutation, elitism) {
  var newpop = [];
  var p1,p2,offspring,c;
  while (newpop.length < population.length) {
      p1 = population[select(fitnesses)];
      p2 = population[select(fitnesses)];
      offspring = crossover(p1, p2, pcrossover).c;
      for (var i=0;i<offspring.length;i++) {
          c = mutation(offspring[i], pmutation);
          if (newpop.length < population.length) {
              newpop.push(c);
          } else {
              break;
          }
      }
  }
  var newfitnesses = [];
  for(var j=0;j<newpop.length;j++) {
    newfitnesses.push(cal_fitness(newpop[j],area,gain));
  }
  var oldbest,ibest,newbest,inewbest,newworst,inewworst;
  oldbest = Math.max.apply(null, fitnesses);
  newbest = Math.max.apply(null, newfitnesses);
  newworst = Math.min.apply(null, newfitnesses);
  ibest = fitnesses.indexOf(oldbest);
  inewbest = newfitnesses.indexOf(newbest);
  inewworst = newfitnesses.indexOf(newworst);
  if (elitism) {
      if (oldbest > newbest) {
          newpop[inewworst] = population[ibest];
          newfitnesses[inewworst] = oldbest;
      }
  }
  for (var k=0; k<newpop.length;k++){
      printed('[ '+ newpop[k]+' ]  '+newfitnesses[k]);
  }

  return {newpop: newpop, newfitnesses: newfitnesses};
}

function maximization_result(popsize, numgenerations, pcrossover, pmutation, elitism, item_count, area, gain){
  var best_result = [];
  var mean_result = [];
  var worst_result = [];
  // var population = [];
  var initial = initialization(popsize, item_count, area, gain);
  var population = initial.population;
  var fitnesses = initial.fitnesses;
  best_result.push(Math.max.apply(null, fitnesses));
  mean_result.push(fitnesses.reduce((a, b) => a + b, 0)/fitnesses.length);
  worst_result.push(Math.min.apply(null, fitnesses));
  printed('Generation 0');
  printed('[ population ]  fitness');
  for (var i=0;i<population.length;i++){
      printed('[ '+population[i]+' ]  '+fitnesses[i]);
  }
  printed('Result for Generation 0 : '+best_result[0]);
  var gen = 1;
  var generation1;
  move(0,1);
  for (var j=0;j<numgenerations-1;j++) {
    move(j,numgenerations-2);
    printed('Generation '+gen);
    printed('[ population ]  fitness');
    generation1 = generation(population, fitnesses, pcrossover, pmutation, elitism); 
    population = generation1.newpop;
    fitnesses = generation1.newfitnesses;
    best_result.push(Math.max.apply(null, fitnesses));
    mean_result.push(fitnesses.reduce((a, b) => a + b, 0)/fitnesses.length);
    worst_result.push(Math.min.apply(null, fitnesses));
    printed('Result for Generation '+gen+' : '+best_result[gen]);
    gen += 1;
  }
  var ibest_fitness = fitnesses.indexOf(best_result[numgenerations-1]);
  var best_pop = population[ibest_fitness];
  console.log('ibest_fitness'+ibest_fitness);
  console.log('best_pop '+best_pop);
  
  return {best: best_result,mean: mean_result,worst: worst_result, best_pop: best_pop};
}

function preprocess_data(kosts) {
    var elem = document.getElementById("myBar");
    var width = 10;
    var id = setInterval(frame, 5);
    function frame() {
      if (width >= 99) {
        clearInterval(id);
        process_data(kosts);
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
      }
    }
    
}

function process_data(kosts) {
  var tag1 = document.getElementById('item_count').value;
  var tag2 = document.getElementById('threshold').value;
  var tag3 = document.getElementById('num_gen').value;
    if(tag1=='' || tag2 == '' || tag3 == ''){
      document.getElementById('output').innerHTML = '<code>Data incomplete!</code>';
    } else {
      document.getElementById('output').innerHTML = '';
      item_number = [];
      area = [];
      gain = [];
      threshold = kosts[0].threshold;
      for(var i=2; i<kosts.length;i++) {
        item_number.push(i-1);
        area.push(kosts[i].area);
        gain.push(kosts[i].profit);
      }
      item_count = item_number.length;
      var elitism;
      if(document.getElementById('elitism').checked == true) {
        elitism = true;
      } else {
        elitism = false;
      }
      console.log('success');
      //test
      var popsize = 20;
      var numgenerations = kosts[1].num_gen;
      var pcrossover = 0.9;
      var pmutation = 0.1;
      var result = maximization_result(popsize, numgenerations, pcrossover, pmutation, elitism, item_count, area, gain);
      var best_result = result.best;
      var mean_result= result.mean;
      var worst_result = result.worst;
      var best_pop = result.best_pop;
      console.log(best_result);
      console.log(mean_result);
      console.log(worst_result);
      creategraph(best_result,mean_result, worst_result, numgenerations);
      alert(printed_value(best_pop, best_result, numgenerations));
    }
}

function generatejsonvalue(){
  var kosts = [];
  var threshold = document.getElementById('threshold').value;
  var num_gen = document.getElementById('num_gen').value;  
  var kost;
  var count = document.getElementById('item_count').value;
  threshold = {
    threshold: parseInt(threshold)
  };
  kosts.push(threshold);
  num_gen = {
    num_gen: parseInt(num_gen)
  };
  kosts.push(num_gen);

  move(0,1);

  for(var i=1; i<=count;i++) {
    kost = {
      id: i,
      area: parseInt(document.getElementById('item-'+i).value),
      profit: parseInt(document.getElementById('gain-'+i).value)
    };
    kosts.push(kost);
  }
  // document.forms[0].reset();
  //document.querySelector('form').reset();
  
  //for display purposes only
  console.warn('added' , {kosts} );
  var pre = document.querySelector('#msg pre');
  pre.textContent = '\n' + JSON.stringify(kosts, '\t', 2);
                          
  //saving to localStorage
  localStorage.setItem('MykostList', JSON.stringify(kosts));
  preprocess_data(kosts);
}

function clearjsonvalue(){
  document.getElementById('output').innerHTML = '';
  var kosts = [];
  var pre = document.querySelector('#msg pre');
  pre.textContent = '\n' + JSON.stringify(kosts, '\t', 2);
  //saving to localStorage
  localStorage.setItem('MykostList', JSON.stringify(kosts));
  item_number = [];
  area = [];
  gain = [];
  if(myChart != null) {
    myChart.destroy();
  }
  move(0,1);
  var ic = document.getElementById('item_count').value;
  document.getElementById('num_gen').value = null;
  document.getElementById('threshold').value = null;
  for(var i=1; i<=ic; i++) {
    document.getElementById('item-'+i).value = null;
    document.getElementById('gain-'+i).value = null;
  }
  setTimeout(function(){
    alert('Data cleared successfully!');
  },500);
}

function randomjsonvalue() {
  var ic = document.getElementById('item_count').value;
  document.getElementById('num_gen').value = random_int(3,50);
  var min = 101, temp, sum = 0;
  for(var i=1; i<=ic; i++) {
    temp = random_int(100,800);
    document.getElementById('item-'+i).value = temp;
    document.getElementById('gain-'+i).value = random_int(40,320)*100000;
    sum += temp;
    if(temp < min) {
      min = temp;
    } 
  }
  if(random_int(0,1) == 1) {
    document.getElementById('elitism').checked = true;
  } else {
    document.getElementById('elitism').checked = false;
  }
  
  document.getElementById('threshold').value = random_int(min+parseInt((sum-min)/2),sum);
}

function creatediv() {
  var item_count = document.getElementById("item_count").value;
  var input_data = document.getElementById("input_data");
  console.log('total item : '+item_count);
  var start,label0,input1,input2,end;
  input_data.innerHTML = '<tr><th>Boarding House Type</th><th>Area (m<sup>2</sup>)</th><th>Profit</th></tr>';
  for(var i=1; i<=item_count;i++) {
    start = '<tr>';
    label0 = '<td>'+i+'</td>';
    input1 = '<td><input type="number" id="item-'+i+'" name="item-'+i+'" required></td>';
    input2 = '<td><input type="number" id="gain-'+i+'" name="gain-'+i+'" required></td>';
    end = '</tr>';
    input_data.innerHTML += start+label0+input1+input2+end;
  }
}

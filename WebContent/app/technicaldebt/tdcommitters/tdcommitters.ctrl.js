homeApp = angular.module('homeApp');

homeApp.controller('TDCommittersCtrl', function ($scope, $http, $q, sidebarService) {

	var thisCtrl = this;

	$scope.currentPage = sidebarService.getCurrentPage();

	$scope.filtered.repository = sidebarService.getRepository();
  $scope.filtered.tags = sidebarService.getTags();
	$scope.filtered.debts = sidebarService.getDebts();
	$scope.tdItems = sidebarService.getTdItems();

  $scope.getGraphData = function(committersEmails, dateIni, dateEnd) {
    console.log('getGraphData', committersEmails, dateIni, dateEnd)
  	console.log('$scope.tdItems', $scope.tdItems)
	  var data = [],
	  		dates = [];
	  // Get data & dates
	  for (i in $scope.tdItems) {
	  	var dataExists = false;
	  	for (x in data) {
	  		if (data[x].key == $scope.tdItems[i].tdIndicator.name) {
	  			dataExists = true;
	  		}
	  	}
	  	if (dataExists == false) {
	  		data.push({
	  			"key": $scope.tdItems[i].tdIndicator.name,
	  			"values": []
	  		})
	  	}
	  	if (dates.indexOf($scope.tdItems[i].commit.date.getTime()) === -1) {
	  		if (committersEmails.length > 0) {
	  			if (committersEmails.indexOf($scope.tdItems[i].committer.email) > -1) {
			  		var date = getGraphDataDate($scope.tdItems[i], committersEmails, dateIni, dateEnd);
			  		if (date != null) {
			  			dates.push(date);
			  		}
	  			}
	  		} else {
		  		var date = getGraphDataDate($scope.tdItems[i], committersEmails, dateIni, dateEnd);
		  		if (date != null) {
		  			dates.push(date);
		  		}
	  		}
	  	}
	  }
	  dates.sort();
	  // Get values
	  for (i in data) {
	  	for (z in dates) {
	  		var total = 0;
	  		for (x in $scope.tdItems) {
	  			if ($scope.tdItems[x].tdIndicator.name == data[i].key && $scope.tdItems[x].commit.date.getTime() == dates[z]) {
	  				if (committersEmails.length > 0) {
	  					if (committersEmails.indexOf($scope.tdItems[x].committer.email) > -1) {
	  						total++;
	  					}
	  				} else {
	  					total++;
	  				}
	  			}
	  		}
	  		data[i].values.push([dates[z], total]);
	  	}
	  }
	  data.map(function(series) {
		  series.values = series.values.map(function(d) { 
		  	return {x: d[0], y: d[1] } 
		  });
		  return series;
		});
    console.log('getGraphData returned data', data)
		return data;
  }

  function getGraphDataDate(tdItems, committersEmails, dateIni, dateEnd) {
  	var date = null;
		if (dateIni instanceof Date || dateEnd instanceof Date) {
			if (dateIni instanceof Date && dateEnd instanceof Date) { 
				if (tdItems.commit.date.getTime() >= dateIni.getTime() && dateIni instanceof Date && tdItems.commit.date.getTime() <= dateEnd.getTime()) {
					date = tdItems.commit.date.getTime();
				}
			} else if (dateIni instanceof Date && tdItems.commit.date.getTime() >= dateIni.getTime()) {
				date = tdItems.commit.date.getTime();
			} else if (dateEnd instanceof Date && tdItems.commit.date.getTime() <= dateEnd.getTime()) {
				date = tdItems.commit.date.getTime();
			}
		} else {
  		date = tdItems.commit.date.getTime();
		}
		return date;
	}


	var graphCommitterUpdate;
	$scope.graphGlobalOptions = {
    chart: {
      type: 'lineWithFocusChart',
      height: 300,
      margin : {
        top: 20,
        right: 20,
        bottom: 60,
        left: 40
      },
      duration: 300,
      title: {
        enable: true,
        text: 'Technical Debt Total'
      },
      xAxis: {
        axisLabel: 'Date',
        tickFormat: function(d) {
          return d3.time.format('%b-%y')(new Date(d))
        },
        showMaxMin: false
      },
      x2Axis: {
        tickFormat: function(d) {
          return d3.time.format('%b-%y')(new Date(d))
        },
        showMaxMin: false
      },
      yAxis: {
       axisLabel: 'Y1 Axis',
        tickFormat: function(d){
            return d3.format(',f')(d);
        },
        axisLabelDistance: 12
      },
      y2Axis: {
				axisLabel: 'Y2 Axis',
        tickFormat: function(d) {
          return '$' + d3.format(',.2f')(d)
        }
    	},
      callback: function(chart){
        chart.dispatch.on('brush', function (brushExtent) {
        	graphCommitterUpdateTimeout(Math.floor(brushExtent.extent[0]), Math.floor(brushExtent.extent[1]))
				});
      }
    }
  };

	$scope.graphGlobalData = $scope.getGraphData([], new Date('2000-06-03'), new Date('2017-07-03 23:59:59'));
	$scope.graphCommitterData = [];
	
  $scope.graphCommitterOptions = {
    chart: {
      type: 'lineChart',
      height: 200,
      margin : {
        top: 20,
        right: 20,
        bottom: 40,
        left: 55
      },
      useInteractiveGuideline: true,
      // dispatch: {
      //   stateChange: function(e){ console.log("stateChange"); },
      //   changeState: function(e){ console.log("changeState"); },
      //   tooltipShow: function(e){ console.log("tooltipShow"); },
      //   tooltipHide: function(e){ console.log("tooltipHide"); }
      // },
      xAxis: {
        axisLabel: 'Date',
        tickFormat: function(d) {
          console.log('tickFormat', d)
          return d3.time.format('%d-%b-%y')(new Date(d))
        },
        showMaxMin: false
      },
      yAxis: {
        axisLabel: 'Y1 Axis',
        tickFormat: function(d){
          return d3.format(',f')(d);
        },
        axisLabelDistance: 12
      }
    },
  };
  $scope.getGraphCommitterData = function(dateIni, dateEnd) {
  	console.log('getGraphCommitterData', dateIni, dateEnd)
  	var committers = [];
  	for (i in $scope.tdItems) {
			var committersExists = false;
			var tdItem = $scope.tdItems[i];
      console.log('--- tdItem.commit', tdItem.commit)
			if (dateIni <= tdItem.commit.date && tdItem.commit.date <= dateEnd) {
	  		for (x in committers) {
	  			if (committers[x].email == tdItem.committer.email) {
	  				committersExists = true;
	  				committers[x].lines.added += tdItem.commit.diffs.linesAdded;
	  				committers[x].lines.removed += tdItem.commit.diffs.linesRemoved;
	  				committers[x].principal += tdItem.principal;
	  				break;
	  			}
	  		}
	  		if (committersExists == false) {
	  			tdItem.committer.principal = tdItem.principal;
	  			tdItem.committer.lines = {
	  				added: tdItem.commit.diffs.linesAdded,
	  				removed: tdItem.commit.diffs.linesRemoved
	  			}
	  			committers.push(tdItem.committer);
	  		}
			}
  	}
  	var data = [];
  	for (i in committers) {
  		data.push({
  			committer: committers[i],
  			graph: $scope.getGraphData([committers[i].email], new Date(dateIni), new Date(dateEnd))
  		})
  	}
    console.log('getGraphCommitterData returned data', data)
  	return data;
  }

  function graphCommitterUpdateTimeout(dateIni, dateEnd) {
  	clearTimeout(graphCommitterUpdate);
    graphCommitterUpdate = setTimeout(function(){ 
  		$scope.graphCommitterData = $scope.getGraphCommitterData(dateIni, dateEnd);
      $scope.$apply();
    }, 500);
  }

  $scope.selectView = function(view) {
  	console.log('selectView', view)
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

  if ($scope.currentPage == 'tdcommiters') {
  	console.log("$scope.currentPage == 'tdcommiters'")
  	$scope.tdItems = sidebarService.getTdItems();
  	console.log('$scope.tdItems', $scope.tdItems)
  	$scope.graphCommitterData = $scope.getGraphCommitterData(new Date('2000-01-01'), new Date('2100-01-01 00:00:00'));
  }
});
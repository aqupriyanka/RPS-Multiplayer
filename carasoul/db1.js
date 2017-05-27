var connectionsRef = database1.ref("/connections");
var playersRef = database1.ref("/players");
var messageRef = database1.ref("/chat");

var computerChoices = ["r", "p", "s"];

var player = [];
var turnRef = "/turn";
var index=0;
var dbTurnValue = 1;
var turn=1;



$("#playAgain").on("click",function(e){
	//localStorage.setItem("newGame","true");
	localStorage.removeItem("choice2");
	localStorage.setItem("gameEnd","false");
	localStorage.removeItem("choice1");
    // localStorage.setItem("user2Clicked","true");

    if(dbTurnValue === 1){
	   turn=2;
	   database1.ref(turnRef).set(turn);
	   turn=1;
	   database1.ref(turnRef).set(turn);
   }
   if(dbTurnValue === 2){
    turn=1;
    database1.ref(turnRef).set(turn);
   }
	playersRef.child(localStorage.key1).child("choice").set("");
	playersRef.child(localStorage.key2).child("choice").set("");

	

});

$("#submit").on("click",function(e){
  e.preventDefault();
  player = createPlayer();


  var playerRef = database1.ref("/players/"+index);
  sessionStorage.setItem("playerKey",index);
  playerRef.set(player);
  sessionStorage.setItem("name",$("#name").val());
  
  $("#nameInput").text($("#name").val());
  $("#signIn").hide($("#name").val());
  localStorage.setItem("gameEnd","false");
  $("#status-bar").show();

  $("#userLoginText").text("Welcome "+$("#name").val());

  // index++;
});


$("#rock,#paper,#scissors").on("click", function(){
  sessionStorage.setItem("playerChoice",$(this).attr("value"));
  var key = sessionStorage.getItem("playerKey");
  playersRef.child(key).update({"choice" : $(this).attr("value")});
  var src="";
  if($(this).attr("value") === "rock"){
      src="../img/rock.jpg";
    }else{
      src="../img/"+$(this).attr("value")+".png";
    }
    var img = $("<img>");
    img.attr("src",src);

    console.log("dbTurnValue === ",dbTurnValue);
    if(dbTurnValue  === 1){
      turn = 2;
      localStorage.removeItem("choice2");
      // localStorage.setItem("user2Clicked","true");
      $("#player1Div").append(img);
      localStorage.setItem("choice1",$(this).attr("value"));
  	  localStorage.setItem("gameEnd","false");
    }else{
      turn =1;
      localStorage.setItem("choice2",$(this).attr("value"));
      // localStorage.setItem("user2Clicked","true");
      $("#results").show();
      $("#game").hide();
      $("#player2Div").append(img);
  	  localStorage.setItem("gameEnd","true");

    }

    console.log("BEFORE SETTING DB VALUE");
    database1.ref(turnRef).set(turn);
  	
  	//result window will be visble and rps div will hide.
  	//show user's selected option in result div.

});


//Turns code
database1.ref(turnRef).on("value", function(snap){

	console.log("TURN VALUE IN DB CHANGED");
	if(snap.val()){
  		console.log("Turn value in db is == ",snap.val());
  		console.log("CONDITION 2 == ",localStorage.getItem("key"+snap.val()) === sessionStorage.getItem("playerKey"));

	  dbTurnValue = snap.val();
	  console.log("CHOICE 2 in local Storage === ",localStorage.getItem("choice2"));
	  if(localStorage.getItem("key"+snap.val()) === sessionStorage.getItem("playerKey") ){
	    console.log("game show in db turn code.");
	    if(localStorage.getItem("gameEnd") === "false" ){
	    	//&& localStorage.getItem("newGame") === "true"){

	    	$('#myPleaseWait').modal('hide');
	    	$("#results").hide();
	     	$("#game").show();
	    } else{
	    	$('#myPleaseWait').modal('hide');
	    	$("#results").show();
	    }
	  } else{
	    $("#game").hide();
	    // waitingDialog.show();
	    $('#myPleaseWait').modal('show');
	    if(localStorage.getItem("choice2")){
	    	$('#myPleaseWait').modal('hide');
	    	$("#results").show();
	    }
	  }

	  console.log("CHOICE 2 in LOCALSTORAGE is :: ",localStorage.getItem("choice2"));
		if(localStorage.getItem("choice2")){
			player1Guess = localStorage.getItem("choice1");
		    player2Guess = localStorage.getItem("choice2");

		    rps(player1Guess.charAt(0),player2Guess.charAt(0));

		    var ref1 = "/players/"+localStorage.getItem("key1");
		    var ref2 = "/players/"+localStorage.getItem("key2");

		    database1.ref(ref1).update({"wins" : player1Wins, "looses":player1Looses});
		    database1.ref(ref2).update({"wins" : player2Wins, "looses":player2Looses});

		    if(sessionStorage.getItem("playerKey") === localStorage.getItem("key1")){
		    	$("#wins").text(player1Wins);
		    	$("#looses").text(player1Looses);
		    } else{
		    	$("#wins").text(player2Wins);
		    	$("#looses").text(player2Looses);
		    }
		    
        // if(player1Winner){
		    if(localStorage.getItem("player1Winner") === "true"){
          $("#gameResult").text(localStorage.getItem("player1Name")+" is a Winner");
		    	// alert("Player 1 winner");
		    }else{
          $("#gameResult").text(localStorage.getItem("player2Name")+" is a Winner");
		    	// alert("Player 2 winner")
		    }
      // }
		    showResult();
		} 

	}
},
  function(error){
    console.log("Error has occurred :",error.code);

  });

//AS value added on players tables
playersRef.on("value", function(snap){
 
	 if(snap.val()){
	  console.log("INSIDE value and children ===",snap.numChildren());

	  index=snap.numChildren();
	  if(snap.child(index).exists()){
	    index++;
	  }


	  //remove user from db
	    var ref = "/players/"+sessionStorage.getItem("playerKey");
	    database1.ref(ref).onDisconnect().remove(() =>{
	      database1.ref(turnRef).onDisconnect().remove();
	      // $("#messageDiv").empty();
	      database1.ref("/chat").onDisconnect().remove();
  		  //one of the user is removed.
        localStorage.removeItem("user2Clicked");
  		  localStorage.removeItem("choice2");
  		  localStorage.removeItem("newGame");
	    });

	   }

     if(snap.numChildren > 2){
      $("#results").hide();
      var ref = "/players";
      database1.ref(ref).child(sessionStorage.getItem("playerKey")).remove();
     }

  	 if(snap.numChildren() === 2){
      $("#myModal").modal('hide');
    	console.log("2nd player added");
    	$("#gameWin,#gameLoose").show(); 
    	localStorage.setItem("newGame","true");

    	//RUNS FOR EACH USER AND STORE KEYS IN LOCALSTORAGE FOR USERS.
    	playersRef.once("value").then(function(snapshot) {
	      	var j=0;
		    snapshot.forEach(function(childSnapshot) {
		      var key = childSnapshot.key; // "ada"
		      var childData = childSnapshot.val();

		      if(j==0){
		        localStorage.setItem("key1",key);
		        localStorage.setItem("player1Name",childData.name);
		      } else{
		        localStorage.setItem("key2",key);
		        localStorage.setItem("player2Name",childData.name);
		      }
      

      j++;
      // Cancel enumeration
      // return true;
    }); 

       database1.ref().once("value",function(data){
        if (! (data.hasChild("turn"))){
          console.log("CHanging turn value in Value change listener");  
          database1.ref(turnRef).set(turn);
        }
       });

  
  });


 }
 	if(snap.numChildren() === 1){
 		$("#gameWin,#gameLoose").hide();
    $("#messageDiv").empty();
    
    if(sessionStorage.getItem("playerKey") != "" 
      && snap.child(sessionStorage.getItem("playerKey")).exists()){
    // if(snap.child(sessionStorage.getItem("playerKey")).exists()){
      $("#myModal").modal('show');
    }
    // localStorage.removeItem("user2Clicked");

 	}

  

},
  function(error){
    console.log("Error has occurred :",error.code);

});

 

var messageRef = database1.ref("/chat");
		

		$('#messageInput').keypress(function(e){
		   if(e.keyCode == 13) {
		     var name = sessionStorage.getItem("name");
		  	var text = $('#messageInput').val();
		  	messageRef.push({name:name, text:text});
		  	messageRef.child('currentMessage');
		  	$('#messageInput').val("");
		   }

		});

		messageRef.on('child_added',function(snapshot){
		   var message = snapshot.val();
		  console.log(message);
		  document.getElementById('messageDiv').innerHTML += message.name+'--'+message.text+'<br/>';

		},
    function(error){
      console.log("Error has occurred :",error.code);

  });



function createPlayer(){
  var player = 
  {"name" : "",
  "looses" : "",
  "wins" : "",
  "choice" : ""};
  var name= $("#name").val().trim();

  player.name = name;
  player.looses = 0;
  player.wins = 0;
  player.choice = "";

  return player;

}

var player1Wins = 0; 
var player2Wins = 0; 
var player1Looses = 0;
var player2Looses = 0;
var player1Winner = false;

function rps(player1Guess, player2Guess){
        console.log("inside RPS");
        // If the user presses "r" or "p" or "s", run the game logic.
        if ((player1Guess === "r") || (player1Guess === "p") || (player1Guess === "s")) {
          // This logic determines the outcome of the game (win/loss/tie), and increments the appropriate counter.
          if ((player1Guess === "r") && (player2Guess === "s")) {
            player1Wins++;
            player2Looses++;
            player1Winner = true;
            localStorage.setItem("player1Winner","true");
            console.log("(player1Guess === r) && (player2Guess === s)",player1Wins,player2Wins);

          }
          else if ((player1Guess === "r") && (player2Guess === "p")) {
            player2Wins++;
            player1Looses++;
            localStorage.setItem("player1Winner","false");
            console.log("(player1Guess === r) && (player2Guess === p)",player1Wins,player2Wins);

          }
          else if ((player1Guess === "s") && (player2Guess === "r")) {
            player2Wins++;
            player1Looses++;
            localStorage.setItem("player1Winner","false");
            console.log("(player1Guess === s) && (player2Guess === r)",player1Wins,player2Wins);

          }
          else if ((player1Guess === "s") && (player2Guess === "p")) {
            player1Wins++;
            player2Looses++;
            player1Winner = true;
            localStorage.setItem("player1Winner","true");
            console.log("(player1Guess === s) && (player2Guess === p)",player1Wins,player2Wins);

          }
          else if ((player1Guess === "p") && (player2Guess === "r")) {
            player1Wins++;
            player2Looses++;
            player1Winner = true;
            localStorage.setItem("player1Winner","true");
            console.log("(player1Guess === p) && (player2Guess === r)",player1Wins,player2Wins);

          }
          else if ((player1Guess === "p") && (player2Guess === "s")) {
            player2Wins++;
            player1Looses++;
            localStorage.setItem("player1Winner","false");
            console.log("(player1Guess === p) && (player2Guess === s)",player1Wins,player2Wins);

          }
          else if (player1Guess === player2Guess) {
            console.log.setItem("(player1Guess ===player2Guess)",player1Wins,player2Wins);
            alert("RPS::TIE");

          }
        }

        localStorage.setItem("showResult","true");
    }


function showResult(){

  // $("#results").empty();
  $("#player1Div").empty();
  $("#player2Div").empty();
  var choice = localStorage.getItem("choice1");
      if(choice === "rock"){
        src="../img/rock.jpg";
      }else{
        src="../img/"+choice+".png";
      }
      var img = $("<img>");
      console.log("<IMG> SRC FOR CHOICE1========= ",src);
      img.attr("src",src);
      img.addClass("image");

      $("#player1Div").append(img);

      var choice = localStorage.getItem("choice2");

      if(choice === "rock"){
        src="../img/rock.jpg";
      }else{
        src="../img/"+choice+".png";
      }
      var img = $("<img>");
      console.log("<IMG> SRC FOR CHOICE2========= ",src);
      img.attr("src",src);
      img.addClass("image");

      console.log("APPENDING TO PLAYER2 DIV.............");
      $("#player2Div").append(img);

      $("#player1Name").text(localStorage.getItem("player1Name"));
      $("#player2Name").text(localStorage.getItem("player2Name"));

      $("#results").show();
}

	




const url = window.location.origin;
let socket = io.connect(url);

var myTurn = true;
var symbol;

function getBoardState() {
  var obj = {};

  $(".cell").each(function() {
    obj[$(this).attr("id")] = $(this).text() || "";
  });

  return obj;
}

function isGameOver() {
    var state = getBoardState();
    var matches = ["XXX", "OOO"]; 

   
    var rows = [
      state.r0c0 + state.r0c1 + state.r0c2, 
      state.r1c0 + state.r1c1 + state.r1c2, 
      state.r2c0 + state.r2c1 + state.r2c2, 
      state.r0c0 + state.r1c0 + state.r2c0, 
      state.r0c1 + state.r1c1 + state.r2c1, 
      state.r0c2 + state.r1c2 + state.r2c2, 
      state.r0c0 + state.r1c1 + state.r2c2, 
      state.r0c2 + state.r1c1 + state.r2c0  
    ];


    for (var i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }

    return false;
}
$(document).ready(function() {
    $("#restartb").click(function() {
        window.location.reload();


    });
  });

function renderTurnMessage() {
    if (!myTurn) { 
        $("#message").text("Your opponent's turn");
        $(".cell").attr("disabled", true);
    } else { 
        $("#message").text("Your turn.");
        $(".cell").removeAttr("disabled");
    }
}

function makeMove(e) {
    if (!myTurn) {
        return; 
    }

    if ($(this).text().length) {
        return; 
    }

    socket.emit("make.move", { 
        symbol: symbol,
        position: $(this).attr("id")
    });
}

socket.on("move.made", function(data) {
    $("#" + data.position).text(data.symbol); 

    myTurn = data.symbol !== symbol;

    if (!isGameOver()) { 
        renderTurnMessage();
    } else {
        if (myTurn) {
            $("#message").text("You lost GG.");
            socket.emit("gg");
        } else {
            $("#message").text("You won!");
            socket.emit("Ws");
        }

        $(".cell").attr("disabled", true); 
    }
});



socket.on("game.begin", function(data) {
    symbol = data.symbol; 
    myTurn = symbol === "X"; 
    renderTurnMessage();
});


socket.on("opponent.left", function() {
    $("#message").text("Your opponent left the game.");
    $(".cell").attr("disabled", true);
});

$(function() {
  $(".cell").attr("disabled", true); 
  $(".cell").on("click", makeMove);
});
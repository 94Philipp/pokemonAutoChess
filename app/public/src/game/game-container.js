
// import { Game, CANVAS, Scale } from "phaser";
import LoginScene from "./scenes/login-scene";
import GameScene from "./scenes/game-scene";

class GameContainer {
  constructor(room, div) {
    this.room = room;
    this.div = div;
    this.game = null;
    this.player = null;
    this.initialState = null;
    console.log("GameContainer", this);
  }

  initialize() {
    initializeGame();
    initializeEvents();
    // Start game
    this.game.scene.stop("loginScene");
    this.game.scene.start("gameScene");
  }

  initializeGame() {
    // Create Phaser game
    let config = {
      type: Phaser.CANVAS,
      width: 2000,
      height: 1000,
      pixelArt: true,
      scene: [LoginScene, GameScene],
      scale: { mode: Phaser.Scale.FIT }
    };
    this.game = new Phaser.Game(config);
  }

  initializeEvents() {
    // Room event listener
    window.sessionId = this.room.sessionId;
    this.room.onStateChange.once(state => {
       window.state = state;
    });
    this.room.players.onAdd(player => this.initializePlayer(player));
    this.room.onMessage(msg => this.handleRoomMessage(msg));
    this.room.onLeave(client => this.handleRoomLeft(client));
    this.room.onError(err => console.log("room error", err));
    // Game event listener
    window.addEventListener("shop-click", e => this.onShopClick(e));
    window.addEventListener("player-click", e => this.onPlayerClick(e));
    window.addEventListener("refresh-click", e => this.onRefreshClick(e));
    window.addEventListener("level-click", e => this.onLevelClick(e));
    window.addEventListener("drag-drop", e => this.onDragDrop(e));
  }

  initializePlayer(player) {
    this.player = player;
    this.game.scene.getScene("gameScene").playerContainer.updatePortraits();
    this.player.onChange = (changes => {
      changes.forEach(change => this.handlePlayerChange(change));
    });
    // force "onChange" to be called immediatelly
    this.player.triggerAll();
  }

  handleRoomStateChange(change) {
    if (this.initialState == null) return;
    switch (change.field) {
      case "time":
        this.game.scene.getScene("gameScene").updateTime();
        break;
      case "phase":
        this.game.scene.getScene("gameScene").updatePhase();
        break;
    }
  }

  handlePlayerChange(change) {
    if (this.game == null) return;
    switch (change.field) {
      case "money":
        if (this.room.sessionId == this.player.id) {
          this.game.scene.getScene("gameScene").updateMoney();
        }
        break;
      case "shop":
        this.game.scene.getScene("gameScene").shopContainer.updatePortraits();
        break;
      case "board":
        this.game.scene.getScene("gameScene").boardManager.update();
        break;
      case "experienceManager":
        this.game.scene.getScene("gameScene").playerContainer.updatePortraits();
        break;
      case "simulationResult":
        console.log(player.simulationResult);
        break;
    }
  }

  handleRoomMessage(message) {
    console.log("room message", message);
    switch (message.message) {
      case "DragDropFailed":
        this.game.scene.getScene("gameScene").boardManager.update();
        break;
    }
  }

  handleRoomLeft(client) {
    sessionStorage.setItem("PAC_Room_ID", room.id);
    sessionStorage.setItem("PAC_Session_ID", room.sessionId);
    console.log(client.id, "left", room.name);
  }

  onPlayerClick(event) {
    var scene = this.game.scene.getScene("gameScene");
    scene.fade();
    scene.boardManager.clear();
    scene.boardManager.player = window.state.players[event.detail.id];
    scene.boardManager.buildPokemons();
  }

  onShopClick(event) {
    this.room.send({ "event": "shop", "id": event.detail.id });
  }

  onRefreshClick(event) {
    this.room.send({ "event": "refresh" });
  }

  onLevelClick(event) {
    this.room.send({ "event": "levelUp" });
  }

  onDragDrop(event) {
    this.room.send({ "event": "dragDrop", "detail": event.detail });
  }
}

export default GameContainer;

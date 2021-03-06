

var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {
        // map tiles
        this.load.image('tiles', 'assets/map/tiles.png');
        
        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');
        
        // our main characters
        this.load.spritesheet('player', 
                              'assets/sprites/sprite.png',
                              {frameWidth: 16, frameHeight: 16});

	this.load.audio('music', [
            'assets/audio/overworld.ogg'
	]);

        this.load.spritesheet('enemy',
                              'assets/sprites/roguelikecreatures.png',
                              {frameWidth: 16, frameHeight: 16})
    },

    create: function ()
    {
        // start the WorldScene
        this.scene.start('WorldScene');
    }
});

var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function WorldScene ()
    {
        Phaser.Scene.call(this, { key: 'WorldScene' });
    },

    preload: function ()
    {

    },

    create: function ()
    {
	// play music
        var music = this.sound.add('music', {loop: true});
	music.play();

	// create the map
        var map = this.make.tilemap({ key: 'map' });
        
        // first parameter is the name of the tilemap in tiled
        var tiles = map.addTilesetImage('tiles', 'tiles');
        
        // creating the layers
        var background = map.createStaticLayer('Background', tiles, 0, 0);
        var levels = map.createStaticLayer('Walls', tiles, 0, 0);
        var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
        
        // make all tiles in obstacles collidable
        obstacles.setCollisionByExclusion([-1]);
        
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', 
						    {frames: [0, 1, 2]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', 
						    {frames: [3, 4, 5]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', 
						    {frames: [6, 7, 8]}),
            frameRate: 10,
            repeat: -1
        });        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', 
						    {frames: [9, 10, 11]}),
            frameRate: 10,
            repeat: -1
        });

        // our player sprite created through the phycis system
        this.player = this.physics.add.sprite(48, 160, 'player', 6);
        
        // don't go out of the map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);
        
        // don't walk on trees
        this.physics.add.collider(this.player, obstacles);

        // limit camera to map
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; // avoid tile bleed
    
        // user input
        this.cursors = this.input.keyboard.createCursorKeys();

        enemy_indexes = [0, 1, 2, 3, 4, 5, 6,
                         8, 9, 10, 11, 12, 13,
                         16, 17, 18, 19, 20, 21,
                         24, 25, 26,
                         32, 33, 34, 35, 36, 37, 38, 39,
                         40, 41, 42, 43, 44, 45, 46, 47,
                         48, 49, 50, 51, 52, 53, 54,
                         56, 57, 58, 59, 60, 61, 62, 63,
                         64, 65, 66, 67, 68, 69, 70]
        // where the enemies will be
        this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Sprite });
        this.badguy1 = this.spawns.create(224, 16, 'enemy', 1)
        this.badguy1.maxY = 80
        this.badguy1.minY = 16
        this.badguy1.speed = 1

        this.badguy2 = this.spawns.create(112, 416, 'enemy', 2)
        this.badguy2.maxY = 464
        this.badguy2.minY = 416
        this.badguy2.speed = 1

        this.badguy3 = this.spawns.create(224, 16, 'enemy', 1)
        this.badguy3.maxY = 80
        this.badguy3.minY = 16
        this.badguy3.speed = 1
	
        this.badguy4 = this.spawns.create(224, 16, 'enemy', 1)
        this.badguy4.maxY = 80
        this.badguy4.minY = 16
        this.badguy4.speed = 1
	
        // add collider
        this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);
    },
    onMeetEnemy: function(player, zone) {        
        // we move the zone to some other location
        zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
        
        // shake the world
        this.cameras.main.shake(300);
        
        // start battle 
    },
    update: function (time, delta)
    {
    //    this.controls.update(delta);
    
        this.player.body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown)
        {
            this.player.body.setVelocityX(-80);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.setVelocityX(80);
        }

        // Vertical movement
        if (this.cursors.up.isDown)
        {
            this.player.body.setVelocityY(-80);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.body.setVelocityY(80);
        }        

        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown)
        {
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.anims.play('right', true);
        }
        else if (this.cursors.up.isDown)
        {
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.anims.play('down', true);
        }
        else
        {
            this.player.anims.stop();
        }

        // enemy movement
        if (this.badguy1.y > this.badguy1.maxY ||
            this.badguy1.y < this.badguy1.minY) {
            this.badguy1.speed *= -1
        }
        this.badguy1.y += this.badguy1.speed

        if (this.badguy2.y > this.badguy2.maxY ||
            this.badguy2.y < this.badguy2.minY) {
            this.badguy2.speed *= -1
        }
        this.badguy2.y += this.badguy2.speed
    }

});

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 2,
    pixelArt: true,
    audio: {
	disableWebAudio: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        WorldScene
    ]
};
var game = new Phaser.Game(config);

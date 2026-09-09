import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { AstraUI } from "../systems/AstraUI";
import { TouchControls } from "../systems/TouchControls";

/**
 * TestLevelScene - Basic platforming test level
 * This demonstrates player movement, jumping, and basic archery
 */
export class TestLevelScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.GameObjects.Group;
  private astraUI!: AstraUI;

  // HUD elements
  private healthText!: Phaser.GameObjects.Text;
  private manaText!: Phaser.GameObjects.Text;
  private dharmaText!: Phaser.GameObjects.Text;
  private killCountText!: Phaser.GameObjects.Text;

  // Game state
  private killCount: number = 0;

  constructor() {
    super({ key: "TestLevelScene" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0); // Sky blue

    // Create platforms
    this.createPlatforms();

    // Create player
    this.player = new Player(this, 200, 400);

    // Create enemy group
    this.enemies = this.add.group({
      runChildUpdate: true, // This will call update() on all enemies
    });

    // Create test enemies
    this.createEnemies();

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Set up arrow-enemy collision
    this.setupArrowCollisions();

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 2, height);

    // Create HUD
    this.createHUD();

    // Set up player events
    this.setupPlayerEvents();

    // Set up enemy events
    this.setupEnemyEvents();

    // Initialize Astra UI
    this.astraUI = new AstraUI(this);

    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    // Unlock Agneyastra for testing
    this.astraUI.unlockAstra("AGNEYASTRA");
    this.astraUI.unlockAstra("VARUNASTRA");

    // Instructions
    const instructions = this.add
      .text(
        width / 2,
        50,
        "Arrow Keys: Move | UP: Jump | SHIFT: Run | SPACE: Aim & Shoot | 1-5: Astras",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#000000",
          backgroundColor: "#FFFFFF",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    console.log("TestLevelScene: Level created, player ready");
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    const { width, height } = this.cameras.main;

    // Ground
    const groundY = height - 50;
    for (let x = 0; x < width * 2; x += 100) {
      const ground = this.add
        .rectangle(x, groundY, 100, 50, 0x8b4513)
        .setOrigin(0);
      this.platforms.add(ground);
    }

    // Floating platforms (simulating forest/temple structures)
    this.createPlatform(300, 500, 200, 20);
    this.createPlatform(600, 450, 150, 20);
    this.createPlatform(850, 400, 180, 20);
    this.createPlatform(1100, 350, 200, 20);
    this.createPlatform(1400, 300, 150, 20);

    // Higher platforms for advanced platforming
    this.createPlatform(450, 300, 120, 20);
    this.createPlatform(700, 250, 120, 20);
    this.createPlatform(950, 200, 150, 20);

    // Refresh static body for all platforms
    this.platforms.refresh();
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add
      .rectangle(x, y, width, height, 0xd2691e)
      .setOrigin(0);
    this.platforms.add(platform);
  }

  private createHUD(): void {
    const padding = 20;

    // Health
    this.healthText = this.add
      .text(padding, padding, "Health: 100/100", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FF0000",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0);

    // Mana
    this.manaText = this.add
      .text(padding, padding + 40, "Mana: 100/100", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#0000FF",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0);

    // Dharma
    this.dharmaText = this.add
      .text(padding, padding + 80, "Dharma: 0/1000", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFD700",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0);

    // Kill count
    this.killCountText = this.add
      .text(padding, padding + 120, "Kills: 0", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#00FF00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0);

    // Level info
    const levelText = this.add
      .text(
        this.cameras.main.width - padding,
        padding,
        "TEST LEVEL\nBala Kanda",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#FFFFFF",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
          align: "right",
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0);
  }

  private setupPlayerEvents(): void {
    // Health changes
    this.events.on("player-damaged", (health: number, maxHealth: number) => {
      this.healthText.setText(`Health: ${health}/${maxHealth}`);
      this.cameras.main.shake(200, 0.005);
    });

    this.events.on("player-healed", (health: number, maxHealth: number) => {
      this.healthText.setText(`Health: ${health}/${maxHealth}`);
    });

    // Mana changes
    this.events.on("player-mana-used", (mana: number, maxMana: number) => {
      this.manaText.setText(`Mana: ${mana}/${maxMana}`);
    });

    this.events.on("player-mana-restored", (mana: number, maxMana: number) => {
      this.manaText.setText(`Mana: ${mana}/${maxMana}`);
    });

    // Dharma changes
    this.events.on("dharma-changed", (dharma: number) => {
      this.dharmaText.setText(`Dharma: ${dharma}/1000`);
    });

    // Aiming
    this.events.on("player-aim-start", () => {
      console.log("Player started aiming");
      // Show aim indicator
    });

    this.events.on("player-aim-end", () => {
      console.log("Player stopped aiming");
      // Hide aim indicator
    });

    // Arrow shooting
    this.events.on(
      "player-shoot-arrow",
      (data: { x: number; y: number; facingRight: boolean }) => {
        console.log("Player shot arrow", data);
        // Create arrow projectile
      },
    );

    // Death
    this.events.on("player-died", () => {
      console.log("Player died");
      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    });

    // Astra unlocked
    this.events.on("astra-unlocked", (astraId: string) => {
      const text = this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          `Astra Unlocked: ${astraId}`,
          {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#FFD700",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 },
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

      this.tweens.add({
        targets: text,
        alpha: 0,
        y: text.y - 100,
        duration: 3000,
        onComplete: () => text.destroy(),
      });
    });
  }

  private createEnemies(): void {
    // Create some test enemies (Rakshasas) at various positions
    const enemy1 = new Enemy(this, 600, 400, "SUBAHU", "rakshasa");
    enemy1.setPatrolPoints([
      new Phaser.Math.Vector2(500, 400),
      new Phaser.Math.Vector2(700, 400),
    ]);
    this.enemies.add(enemy1);

    const enemy2 = new Enemy(this, 1000, 350, "MARICHA", "rakshasa");
    enemy2.setPatrolPoints([
      new Phaser.Math.Vector2(900, 350),
      new Phaser.Math.Vector2(1200, 350),
    ]);
    this.enemies.add(enemy2);

    const enemy3 = new Enemy(this, 1400, 250, "SUBAHU", "rakshasa");
    this.enemies.add(enemy3);

    console.log(`Created ${this.enemies.getLength()} enemies`);
  }

  private setupArrowCollisions(): void {
    // Set up collision between arrows and enemies
    this.physics.add.overlap(
      this.enemies,
      this.player.getBow().getArrows(),
      (enemyObj, arrowObj) => {
        const enemy = enemyObj as Enemy;
        const arrow = arrowObj as Phaser.Physics.Arcade.Sprite & {
          getDamage?: () => number;
        };

        // Get arrow damage (default to 10 if method doesn't exist)
        const damage = arrow.getDamage ? arrow.getDamage() : 10;

        // Deal damage to enemy
        enemy.takeDamage(damage, arrow);

        // Destroy arrow
        arrow.destroy();

        console.log(`Arrow hit enemy! Damage: ${damage}`);
      },
      undefined,
      this,
    );
  }

  private setupEnemyEvents(): void {
    // Enemy damaged
    this.events.on(
      "enemy-damaged",
      (data: { enemy: Enemy; health: number; maxHealth: number }) => {
        console.log(
          `Enemy damaged: ${data.health}/${data.maxHealth} HP remaining`,
        );
      },
    );

    // Enemy died
    this.events.on(
      "enemy-died",
      (data: { enemy: Enemy; enemyId: string; x: number; y: number }) => {
        console.log(`Enemy died at (${data.x}, ${data.y})`);
        this.killCount++;
        this.killCountText.setText(`Kills: ${this.killCount}`);

        // Increase dharma for killing evil enemies
        this.events.emit("dharma-changed", this.killCount * 10);
      },
    );

    // Enemy attack
    this.events.on(
      "enemy-attack",
      (data: { enemy: Enemy; damage: number; x: number; y: number }) => {
        // Check if player is in range and deal damage
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          data.x,
          data.y,
        );

        if (distance < 80) {
          this.player.takeDamage(data.damage);
          console.log(`Player hit by enemy! Damage: ${data.damage}`);
        }
      },
    );
  }
}

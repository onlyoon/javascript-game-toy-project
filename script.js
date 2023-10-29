
// 전체 페이지가 로드될 경우 생성되는 리스너
// 모든 이미지 파일과 같은 것들이 자바스크립트 코드가 실행되기 전에, 로드돠어야 한다.
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    // 사용자의 입력값을 받는 handler
    class InputHandler {
        constructor(game) {
            this.game = game;
            // 사용자의 키보드 입력 감지시
            window.addEventListener('keydown', e => {
                // ↑ 혹은 ↓ 버튼을 누르면, keys 배열에 저장이 된다.
                if (((e.key === 'ArrowUp') ||
                    (e.key === 'ArrowDown'))
                    && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                    // spacebar을 누르면, shootTop() 함수가 실행된다.
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                }
            });
            // 사용자의 키보드 입력 종료 감지시
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > - 1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    // 사용자의 공격 피사체
    class Proejctile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        // 총알 위치 업데이트
        update() {
            this.x += this.speed;
            // 일정 거리 이상으로 이동하면 삭제
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        // 총알 paint
        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height) // 함수로 사각형을 그리는 메서드
        }
    }

    // 데미지를 받은 후의 효과
    class Particle {

    }

    // 사용자 캐릭터 제어
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0.0;
            this.maxSpeed = 2;
            this.projectiles = [];
        }
        // 화살표 키 사용시, speed 2, 미사용시 speed 0
        update() {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
        }
        // user paint
        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            // user의 bullet paint
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        // 사용자가 총을 쏘는 함수
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Proejctile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
        }
    }

    class Enemy {
        // 적군 동작 제어
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }


    class Layer {
        // 배경의 레이어 계층

    }

    class Background {
        // 모든 레이어 계층의 것들을 보여주는 것

    }

    class UI {
        // 게임을 위한 UI
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }
        draw(context) {
            //ammo
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
        }
    }

    class Game {
        // 모든 로직 집합체
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this); // this를 인자로 집어넣을 경우, 이 인자는 해당 Class constructor내에서 사용된다.
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = []; // 전역 클래스 프로퍼티로 다른 모든 클래스의 렉시컬 환경에서 사용 가능
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            // ammo를 위한 loop Timer
            this.ammoTimer = 0;
            // ammo 탄창 다 사용시 걸리는 interval timer 
            this.ammoInterval = 500;
            this.gameOver = false;
        }
        // user 객체 업데이트
        update(deltaTime) {
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        // user 객체 그리기
        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
            console.log(this.enemies);
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp) {
        //  DeltaTime is t he difference in ms between the timestamp from this loop and the timestamp from the previous loop
        // deltaTime을 활용해서 16번의 프레임을 만들어 내기, 느린 델타 타임이 요구되거나 사용자의 컴퓨터가 슈퍼 컴퓨터라면, 사용할 필요는 없다.
        const deltaTime = timeStamp - lastTime;
        // console.log(deltaTime);
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // periodic event
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});

<template>
  <q-page class="inicio">

    <main class="welcome-container">

      <div class="hero">

      <section
        class="logo-section"
        aria-label="Identidad de SENA Market"
      >

        <div class="cart-scene">

          <!--
            Carro de compras detallado: manija con agarre, cesta con malla,
            eje y ruedas con radios. Sus fichas se pintan una a una dentro
            de la cesta y deletrean "SENA MARKET" (fila 1: SENA, fila 2:
            MARKET). GSAP repite el ciclo en bucle.
          -->
          <div
            class="cart-scale"
          >

            <div
              ref="cart"
              class="cart"
              aria-label="Carro de compras con las letras de SENA Market"
            >

              <div
                class="cart-handle"
                aria-hidden="true"
              ></div>

              <div
                class="cart-grip"
                aria-hidden="true"
              ></div>

              <div class="cart-basket">

                <div
                  class="basket-mesh"
                  aria-hidden="true"
                ></div>

                <div class="basket-tiles">

                  <div class="tile-row">
                    <span
                      v-for="(letra, i) in filaSena"
                      :key="'sena-' + i"
                      ref="fichas"
                      class="tile"
                      aria-hidden="true"
                    >{{ letra }}</span>
                  </div>

                  <div class="tile-row">
                    <span
                      v-for="(letra, i) in filaMarket"
                      :key="'market-' + i"
                      ref="fichas"
                      class="tile"
                      aria-hidden="true"
                    >{{ letra }}</span>
                  </div>

                </div>

              </div>

              <div
                class="cart-axle"
                aria-hidden="true"
              ></div>

              <div
                class="cart-wheel cart-wheel-left"
                aria-hidden="true"
              ></div>

              <div
                class="cart-wheel cart-wheel-right"
                aria-hidden="true"
              ></div>

            </div>

          </div>

          <!-- Sombra elíptica en el suelo (no se balancea con el carro) -->
          <div
            class="cart-floor-shadow"
            aria-hidden="true"
          ></div>

        </div>

      </section>


      <section class="welcome-content">

        <span class="welcome-label">
          CONTROL DE INVENTARIO
        </span>

        <h1>
          Bienvenido a
          <span>SENA Market</span>
        </h1>

        <p class="welcome-description">
          Una herramienta sencilla para administrar el inventario
          de tu tienda, consultar existencias y mantener el control
          de cada movimiento de mercancía.
        </p>

        <q-btn
          class="start-button"
          unelevated
          rounded
          label="Ingresar al inventario"
          icon-right="none"
          to="/dashboard"
          aria-label="Ingresar al inventario"
        >
          <span class="button-arrow" aria-hidden="true">
            →
          </span>
        </q-btn>

      </section>

      </div>


      <section
        class="features"
        aria-label="Características principales"
      >

        <div class="feature-item">

          <span class="feature-icon feature-icon--inventario" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 7.5 12 4l8 3.5-8 3-8-3Z"/>
              <path d="M4 7.5V16l8 4 8-4V7.5"/>
              <path d="M12 10.5V20"/>
            </svg>
          </span>

          <span>
            Inventario
          </span>

        </div>


        <div class="feature-divider"></div>


        <div class="feature-item">

          <span class="feature-icon feature-icon--movimientos" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M7 7h11"/>
              <path d="m15 3 4 4-4 4"/>
              <path d="M17 17H6"/>
              <path d="m9 13-4 4 4 4"/>
            </svg>
          </span>

          <span>
            Movimientos
          </span>

        </div>


        <div class="feature-divider"></div>


        <div class="feature-item">

          <span class="feature-icon feature-icon--alertas" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3 21 19H3L12 3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 16h.01"/>
            </svg>
          </span>

          <span>
            Alertas
          </span>

        </div>

      </section>

    </main>


    <footer class="footer">

      <div class="footer-content">

        <span class="footer-brand">
          SENA Market
        </span>

        <span class="footer-dot">
          •
        </span>

        <span>
          Gestión de inventario
        </span>

        <span class="footer-dot">
          •
        </span>

        <span>
          Control simple y eficiente
        </span>

        <span class="footer-year">
          © {{ currentYear }}
        </span>

      </div>

    </footer>

  </q-page>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

import { gsap } from 'gsap'


const cart = ref(null)

// ---------------------------------------------------------------------------
// FICHAS DEL CARRO
// Dos filas de fichas dentro de la cesta deletrean "SENA MARKET":
// fila 1 -> SENA, fila 2 -> MARKET. GSAP las hace aparecer en secuencia
// y repite el ciclo en bucle (sin setInterval/setTimeout sueltos).
// ---------------------------------------------------------------------------
const filaSena = ['S', 'E', 'N', 'A']

const filaMarket = ['M', 'A', 'R', 'K', 'E', 'T']

// Ref colectiva: Vue junta aquí las 10 fichas en orden de render.
const fichas = ref([])

const currentYear = computed(() => {
  return new Date().getFullYear()
})

let timeline = null

let balanceo = null


onMounted(() => {

  if (!cart.value || !fichas.value.length) {
    return
  }

  // Pequeño balanceo permanente del carro (se detiene en onUnmounted).
  balanceo = gsap.to(cart.value, {
    rotation: 2.5,
    duration: 1.7,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    transformOrigin: '50% 90%'
  })

  // UN solo timeline gobierna el ciclo de las fichas: entran en secuencia
  // hasta deletrear "SENA MARKET", se deja leer y vuelve a empezar.
  timeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 1
  })

  // Las fichas caen dentro de la cesta una a una.
  timeline.from(fichas.value, {
    y: -70,
    opacity: 0,
    scale: 0.5,
    rotation: -10,
    duration: 0.55,
    ease: 'back.out(1.6)',
    stagger: 0.16
  })

  // Pausa para que la palabra se lea completa.
  timeline.to(fichas.value, {
    duration: 1.6
  })

  // Salen juntas hacia abajo y el ciclo vuelve a empezar.
  timeline.to(fichas.value, {
    y: 26,
    opacity: 0,
    duration: 0.4,
    ease: 'power1.in',
    stagger: 0.04
  })

  timeline.set(fichas.value, {
    y: 0
  })

})


onUnmounted(() => {

  // Al salir de la bienvenida se detiene TODO: las animaciones del carro
  // no pueden quedar ejecutándose de fondo bajo el Dashboard.
  if (timeline) {
    timeline.kill()
    timeline = null
  }

  if (balanceo) {
    balanceo.kill()
    balanceo = null
  }

})

</script>


<style scoped>

/*
=====================================================
PALETA Y FONDO
=====================================================
Base blanca original. El degradado morado/violeta/azul
solo aparece en los BORDES (esquinas), dejando el
centro blanco.
*/

.inicio {

  --primary: #205297;
  --primary-light: #173F70;
  --text: #1E293B;
  --muted: #64748B;
  --border: #E2E8F0;

  position: relative;

  width: 100%;
  min-height: 100vh;

  background:
    radial-gradient(
      ellipse 65% 55% at 100% 0%,
      rgba(109, 40, 217, 0.20),
      transparent 62%
    ),
    radial-gradient(
      ellipse 42% 38% at 93% 11%,
      rgba(79, 70, 229, 0.15),
      transparent 65%
    ),
    radial-gradient(
      ellipse 62% 52% at 0% 100%,
      rgba(168, 85, 247, 0.20),
      transparent 60%
    ),
    radial-gradient(
      ellipse 34% 30% at 4% 90%,
      rgba(236, 72, 153, 0.14),
      transparent 58%
    ),
    radial-gradient(
      circle at 50% 30%,
      rgba(15, 41, 77, 0.055),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      #FFFFFF 0%,
      #FCFDFE 100%
    );

  color: var(--text);

  overflow: hidden;

}


.welcome-container {

  width: min(100%, 1180px);

  min-height: 100vh;

  margin: 0 auto;

  padding:
    46px
    32px
    110px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

}


/*
=====================================================
HERO (ILUSTRACIÓN + CONTENIDO) — 50% / 50%
=====================================================
*/

.hero {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  align-items: center;

  gap: 40px 64px;

  width: 100%;

  max-width: 1180px;

  margin: 0 auto;

  text-align: left;

}


.logo-section {

  display: flex;

  flex-direction: column;

  align-items: center;

}


/*
=====================================================
CARRO DE COMPRAS (MITAD IZQUIERDA)
=====================================================
Diseño base de 300x210 px escalado con .cart-scale
para llenar su columna sin romper el grid.
*/

.cart-scene {

  position: relative;

  width: 100%;

  max-width: 480px;

  height: 380px;

  display: flex;

  align-items: center;

  justify-content: center;

}


.cart-scale {

  transform: scale(1.5);

  transform-origin: center;

}


.cart {

  position: relative;

  width: 300px;

  height: 210px;

  will-change: transform;

}


/* Manija inclinada que sale de la cesta hacia arriba a la izquierda */
.cart-handle {

  position: absolute;

  top: 40px;

  left: -4px;

  width: 82px;

  height: 9px;

  border-radius: 5px;

  background: var(--primary);

  box-shadow:
    0 2px 6px
    rgba(15, 41, 77, 0.18);

  transform-origin: right center;

  transform: rotate(38deg);

}


/* Agarre vertical en el extremo libre de la manija */
.cart-grip {

  position: absolute;

  top: -2px;

  left: 3px;

  width: 9px;

  height: 26px;

  border-radius: 5px;

  background: var(--primary);

  box-shadow:
    0 2px 6px
    rgba(15, 41, 77, 0.18);

}


.cart-basket {

  position: absolute;

  top: 58px;

  left: 18px;

  box-sizing: border-box;

  width: 264px;

  height: 104px;

  padding: 8px;

  border: 4px solid var(--primary);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.92);

  box-shadow:
    0 12px 28px
    rgba(15, 41, 77, 0.14);

  overflow: hidden;

}


/* Rejilla tipo malla de la cesta */
.basket-mesh {

  position: absolute;

  inset: 0;

  border-radius: 10px;

  background-image:
    linear-gradient(
      rgba(32, 82, 151, 0.10) 2px,
      transparent 2px
    ),
    linear-gradient(
      90deg,
      rgba(32, 82, 151, 0.10) 2px,
      transparent 2px
    );

  background-size: 24px 24px;

  background-position: center;

  pointer-events: none;

}


.basket-tiles {

  position: relative;

  z-index: 1;

  display: flex;

  flex-direction: column;

  gap: 8px;

  align-items: center;

  justify-content: center;

  height: 100%;

}


.tile-row {

  display: flex;

  gap: 6px;

  justify-content: center;

}


.tile {

  width: 30px;

  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  box-sizing: border-box;

  border: 2px solid var(--primary);

  border-radius: 7px;

  background: rgba(32, 82, 151, 0.08);

  color: var(--primary);

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  font-size: 15px;

  font-weight: 800;

  line-height: 1;

  user-select: none;

  box-shadow:
    0 2px 5px
    rgba(15, 41, 77, 0.10);

}


/* Eje y ruedas del carro (con radios) */
.cart-axle {

  position: absolute;

  top: 178px;

  left: 68px;

  width: 164px;

  height: 6px;

  border-radius: 3px;

  background: var(--primary);

}


.cart-wheel {

  position: absolute;

  bottom: 6px;

  box-sizing: border-box;

  width: 44px;

  height: 44px;

  border: 6px solid var(--primary);

  border-radius: 50%;

  /* radios + buje central dibujados con gradientes */
  background:
    radial-gradient(
      circle,
      #FFFFFF 0 20%,
      rgba(32, 82, 151, 0.55) 21% 30%,
      transparent 31%
    ),
    repeating-conic-gradient(
      from 0deg,
      rgba(32, 82, 151, 0.55) 0deg 7deg,
      transparent 7deg 45deg
    );

  box-shadow:
    0 4px 9px
    rgba(15, 41, 77, 0.16);

}


.cart-wheel-left {

  left: 46px;

}


.cart-wheel-right {

  left: 210px;

}


/* Sombra suave en el suelo bajo el carro */
.cart-floor-shadow {

  position: absolute;

  bottom: 34px;

  left: 50%;

  width: 320px;

  height: 32px;

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse,
      rgba(15, 41, 77, 0.16) 0%,
      transparent 70%
    );

  transform: translateX(-50%);

  pointer-events: none;

}


/*
=====================================================
BIENVENIDA (MITAD DERECHA)
=====================================================
Más separación entre título, descripción y botón.
*/

.welcome-content {

  width: 100%;

  max-width: 520px;

  margin-top: 0;

}


.welcome-label {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding:
    8px
    15px;

  border-radius: 999px;

  background:
    rgba(15, 41, 77, 0.07);

  color: var(--primary);

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 1.6px;

}


.welcome-content h1 {

  margin:
    20px
    0
    0;

  color: var(--text);

  font-size: 34px;

  font-weight: 700;

  line-height: 1.2;

}


.welcome-content h1 span {

  color: var(--primary);

}


.welcome-description {

  max-width: 500px;

  margin:
    18px
    0
    0;

  color: var(--muted);

  font-size: 16px;

  line-height: 1.75;

}


/*
=====================================================
BOTÓN
=====================================================
*/

.start-button {

  margin-top: 34px;

  min-height: 50px;

  padding:
    0
    25px;

  background: var(--primary) !important;

  color: #FFFFFF !important;

  font-size: 14px;

  font-weight: 700;

  letter-spacing: 0.1px;

  box-shadow:
    0 8px 22px
    rgba(15, 41, 77, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

}


.start-button:hover {

  transform: translateY(-2px);

  box-shadow:
    0 13px 28px
    rgba(15, 41, 77, 0.26);

}


.start-button:active {

  transform: translateY(0);

}


.button-arrow {

  margin-left: 9px;

  font-size: 20px;

  line-height: 1;

  transition:
    transform 0.2s ease;

}


.start-button:hover .button-arrow {

  transform: translateX(3px);

}


/*
=====================================================
CARACTERÍSTICAS
=====================================================
*/

.features {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 21px;

  margin-top: 48px;

  padding:
    14px
    24px;

  border:
    1px solid
    var(--border);

  border-radius: 15px;

  background:
    rgba(255, 255, 255, 0.88);

  box-shadow:
    0 6px 22px
    rgba(15, 41, 77, 0.055);

  backdrop-filter: blur(8px);

  -webkit-backdrop-filter: blur(8px);

}


.feature-item {

  display: flex;

  align-items: center;

  gap: 8px;

  color: var(--muted);

  font-size: 12px;

  font-weight: 600;

  white-space: nowrap;

}


.feature-icon {

  width: 26px;

  height: 26px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  color: var(--primary);

}


/* Color propio de cada figura (icono) para distinguirlas de un vistazo */
.feature-icon--inventario {

  background: rgba(32, 82, 151, 0.10);

  color: #205297;

}


.feature-icon--movimientos {

  background: rgba(33, 186, 69, 0.12);

  color: #1E9E46;

}


.feature-icon--alertas {

  background: rgba(193, 0, 21, 0.10);

  color: #C10015;

}


.feature-icon svg {

  width: 21px;

  height: 21px;

}


.feature-divider {

  width: 1px;

  height: 23px;

  background: var(--border);

}


/*
=====================================================
FOOTER
=====================================================
*/

.footer {

  position: absolute;

  right: 0;

  bottom: 0;

  left: 0;

  width: 100%;

  padding:
    17px
    24px;

  border-top:
    1px solid
    rgba(226, 232, 240, 0.8);

  background:
    rgba(255, 255, 255, 0.9);

  backdrop-filter: blur(8px);

  -webkit-backdrop-filter: blur(8px);

}


.footer-content {

  display: flex;

  align-items: center;

  justify-content: center;

  flex-wrap: wrap;

  gap: 7px;

  color: #94A3B8;

  font-size: 10px;

  line-height: 1.5;

}


.footer-brand {

  color: var(--primary);

  font-weight: 700;

  letter-spacing: 0.5px;

}


.footer-dot {

  color: #CBD5E1;

}


.footer-year {

  margin-left: 3px;

}


/*
=====================================================
TABLET
=====================================================
*/

@media (max-width: 1024px) {

  .cart-scene {

    height: 330px;

  }


  .cart-scale {

    transform: scale(1.25);

  }


  .welcome-content h1 {

    font-size: 30px;

  }

}


/*
=====================================================
PANTALLA ANGOSTA (HERO EN 1 COLUMNA)
=====================================================
*/

@media (max-width: 860px) {

  .welcome-container {

    padding:
      36px
      22px
      105px;

  }


  .hero {

    grid-template-columns: 1fr;

    gap: 10px;

    justify-items: center;

    text-align: center;

  }


  .cart-scene {

    height: 320px;

  }


  .cart-scale {

    transform: scale(1.15);

  }


  .welcome-content {

    margin-top: 0;

  }


  .features {

    margin-top: 40px;

  }

}


/*
=====================================================
MÓVIL
=====================================================
*/

@media (max-width: 560px) {

  .welcome-container {

    padding:
      24px
      18px
      105px;

  }


  .cart-scene {

    height: 270px;

  }


  .cart-scale {

    transform: scale(0.92);

  }


  .welcome-label {

    font-size: 9px;

  }


  .welcome-content h1 {

    margin-top: 14px;

    font-size: 26px;

  }


  .welcome-description {

    margin-top: 12px;

    font-size: 14px;

    line-height: 1.6;

  }


  .start-button {

    width: 100%;

    max-width: 300px;

  }


  .features {

    width: 100%;

    max-width: 350px;

    gap: 10px;

    padding:
      11px
      9px;

  }


  .feature-item {

    gap: 4px;

    font-size: 10px;

  }


  .feature-icon {

    width: 22px;

    height: 22px;

  }


  .feature-icon svg {

    width: 17px;

    height: 17px;

  }


  .footer {

    padding:
      14px
      15px;

  }


  .footer-content {

    font-size: 9px;

  }

}


/*
=====================================================
PANTALLAS BAJAS
=====================================================
*/

@media (max-height: 700px) {

  .welcome-container {

    padding-top: 20px;

  }


  .cart-scene {

    height: 295px;

  }


  .cart-scale {

    transform: scale(1.1);

  }


  .welcome-content h1 {

    margin-top: 14px;

    font-size: 28px;

  }


  .welcome-description {

    margin-top: 12px;

    font-size: 14px;

    line-height: 1.55;

  }


  .start-button {

    margin-top: 22px;

  }


  .features {

    margin-top: 26px;

  }

}

</style>

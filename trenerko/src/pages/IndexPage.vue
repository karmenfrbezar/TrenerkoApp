<template>
  <q-page class="home">

   
    <section class="hero">
      <h1 class="title">TRENERKO</h1>
      <p class="subtitle">Sportska scena Rijeke na jednom mjestu</p>

     
      <div class="chips">
        <span v-for="s in sports" :key="s.name" class="chip">
          {{ s.icon }} {{ s.name }}
        </span>
      </div>

  
      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <h3>{{ s.number }}</h3>
          <p>{{ s.label }}</p>
        </div>
      </div>
    </section>

    
    <section class="features">
      <div v-for="f in features" :key="f.title" class="card">
        <div class="icon">{{ f.icon }}</div>
        <div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script setup>
const sports = [
  { icon: '⚽', name: 'Nogomet' },
  { icon: '🏀', name: 'Košarka' },
  { icon: '🎾', name: 'Tenis' },
  { icon: '🥊', name: 'Boks' },
  { icon: '🏃', name: 'Trčanje' },
  { icon: '🧘', name: 'Joga' }
]

const stats = [
  { number: '50+', label: 'Objekata' },
  { number: '200+', label: 'Događaja' },
  { number: '1k+', label: 'Korisnika' }
]


</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #e4c9c9;
  color: #000000;
  padding: 3rem 1.5rem;
}


.hero { 
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #308deb;
  letter-spacing: 2px;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 1.5rem;
}


.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.chip {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(7, 6, 6, 0.06);
  font-size: 0.85rem;
}


.actions {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 2rem;
}



.secondary {
  background: transparent;
  border: 1px solid rgba(7, 6, 6, 0.2);
  padding: 10px 18px;
  border-radius: 10px;
  color: rgb(0, 0, 0);
  cursor: pointer;
}


.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat h3 {
  color: #d67733;
  font-size: 1.8rem;
  margin: 0;
}

.stat p {
  opacity: 0.6;
  font-size: 0.8rem;
}



.card {
  width: 220px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  background: rgba(7, 6, 6, 0.06);
}

.icon {
  font-size: 1.4rem;
}
</style>
<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Sve rezervacije</div>

    <div class="row q-mb-md">
      <div class="col-8">
        <q-input
          v-model="gymFilter"
          label="Pretraži po nazivu teretane"
          outlined
          clearable
        />
      </div>
      <div class="col-4 flex flex-center">
        <q-btn label="Pretraži" color="primary" @click="fetchRezervacije" />
      </div>
    </div>

    <div v-if="rezervacije.length === 0" class="text-grey">
      Nema rezervacija.
    </div>

    <q-card
      v-for="rez in rezervacije"
      :key="rez.id"
      class="q-mb-md"
    >
      <q-card-section>
        <div><strong>Korisnik:</strong> {{ rez.username }}</div>
        <div><strong>Teretana:</strong> {{ rez.gym_name }}</div>
        <div><strong>Datum:</strong> {{ rez.reservation_date }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rezervacije = ref([])
const gymFilter = ref('')

const API_URL = 'http://localhost:3000/api/rezervacije'

const fetchRezervacije = async () => {
  try {
    let url = API_URL

    if (gymFilter.value) {
      url += `?gym=${encodeURIComponent(gymFilter.value)}`
    }

    const response = await fetch(url)
    rezervacije.value = await response.json()
  } catch (error) {
    console.error('Greška:', error)
  }
}

onMounted(fetchRezervacije)
</script>

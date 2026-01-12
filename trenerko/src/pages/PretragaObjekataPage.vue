<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Pretraživanje teretana</div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.name"
          label="Naziv teretane"
          outlined
          clearable
        />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.address"
          label="Adresa"
          outlined
          clearable
        />
      </div>

      <div class="col-12 col-md-4 flex flex-center">
        <q-btn
          label="Pretraži"
          color="primary"
          @click="fetchGyms"
          class="q-mr-sm"
        />
        <q-btn label="Reset" flat @click="resetFilters" />
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <div v-if="loading" class="flex flex-center q-my-lg">
      <q-spinner size="40px" />
    </div>

    <div v-else>
      <div v-if="gyms.length === 0" class="text-grey">
        Nema rezultata za zadane kriterije.
      </div>

      <div class="row q-col-gutter-md">
        <div
          v-for="gym in gyms"
          :key="gym.id"
          class="col-12 col-md-4"
        >
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ gym.name }}</div>
              <div class="text-subtitle2 text-grey">
                {{ gym.address }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div>
                <strong>Adresa:</strong> {{ gym.address }}
              </div>
              <div v-if="gym.description">
                <strong>Opis:</strong> {{ gym.description }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Detalji" color="primary" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const gyms = ref([])
const loading = ref(false)

const filters = ref({
  name: '',
  address: ''
})

const API_URL = 'http://localhost:3000/api/teretane'

const fetchGyms = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()

    if (filters.value.name) {
      params.append('name', filters.value.name)
    }

    if (filters.value.address) {
      params.append('address', filters.value.address)
    }

    const response = await fetch(`${API_URL}?${params.toString()}`)
    gyms.value = await response.json()
  } catch (error) {
    console.error('Greška pri dohvaćanju teretana:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value.name = ''
  filters.value.address = ''
  fetchGyms()
}

onMounted(() => {
  fetchGyms()
})
</script>

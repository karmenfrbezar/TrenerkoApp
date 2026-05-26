<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card flat bordered style="width: 500px; max-width: 95%;">

      <q-card-section class="bg-green-6 text-white text-center">
        <div class="text-h6">Moji interesi (Sportovi)</div>
        <div class="text-caption">Odaberi sportove koji te zanimaju</div>
      </q-card-section>

      <q-card-section v-if="!mainUser" class="text-center text-grey q-pa-lg">
        Prijavi se da bi upravljao interesima.
      </q-card-section>

      <q-card-section v-else-if="loading" class="text-center q-pa-lg">
        <q-spinner color="green" size="2em" />
      </q-card-section>

      <q-card-section v-else>
        <div class="row q-col-gutter-sm q-mb-md">
          <div
            v-for="sport in sviSportovi"
            :key="sport.SportID"
            class="col-12"
          >
            <q-item
              clickable
              v-ripple
              :class="jeOdabran(sport.SportID) ? 'bg-green-1' : ''"
              style="border-radius: 8px; border: 1px solid #e0e0e0;"
              class="q-mb-xs"
              @click="toggleInteres(sport.SportID)"
            >
              <q-item-section>
                <q-item-label>{{ sport.NazivSporta }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :model-value="jeOdabran(sport.SportID)"
                  color="green"
                  @update:model-value="toggleInteres(sport.SportID)"
                />
              </q-item-section>
            </q-item>
          </div>
        </div>

        <div v-if="sviSportovi.length === 0" class="text-center text-grey q-pa-md">
          Nema dostupnih sportova.
        </div>

        <q-btn
          unelevated
          color="green"
          label="Spremi interese"
          class="full-width q-mt-sm"
          :loading="saving"
          @click="spremiInterese"
        />

        <div v-if="poruka" class="text-center q-mt-md" :class="porukaGreska ? 'text-red' : 'text-green'">
          {{ poruka }}
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

const API = 'http://localhost:3000'

export default {
  name: 'InteresiPage',
  setup() {
    const mainUser = inject('user')
    const sviSportovi = ref([])
    const mojInteresi = ref([]) // lista SportID-ova
    const loading = ref(true)
    const saving = ref(false)
    const poruka = ref('')
    const porukaGreska = ref(false)

    const ucitaj = async () => {
      if (!mainUser.value) {
        loading.value = false
        return
      }
      try {
        const [sRes, iRes] = await Promise.all([
          fetch(`${API}/api/sportovi`),
          fetch(`${API}/api/interesi/${mainUser.value.id}`)
        ])
        sviSportovi.value = await sRes.json()
        const interesi = await iRes.json()
        mojInteresi.value = interesi.map(i => i.SportID)
      } catch (err) {
        console.error('Greška:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(ucitaj)

    const jeOdabran = (sportId) => mojInteresi.value.includes(sportId)

    const toggleInteres = (sportId) => {
      if (jeOdabran(sportId)) {
        mojInteresi.value = mojInteresi.value.filter(id => id !== sportId)
      } else {
        mojInteresi.value = [...mojInteresi.value, sportId]
      }
    }

    const spremiInterese = async () => {
      saving.value = true
      poruka.value = ''
      try {
        await fetch(`${API}/api/interesi/${mainUser.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sportovi: mojInteresi.value })
        })
        poruka.value = 'Interesi uspješno spremljeni!'
        porukaGreska.value = false
      } catch  {
        poruka.value = 'Greška pri spremanju.'
        porukaGreska.value = true
      } finally {
        saving.value = false
      }
    }

    return {
      mainUser,
      sviSportovi,
      loading,
      saving,
      poruka,
      porukaGreska,
      jeOdabran,
      toggleInteres,
      spremiInterese
    }
  }
}
</script>
<template>
  <q-page class="q-pa-md">

    <!-- NASLOV STRANICE -->
    <div class="text-h5 text-primary q-mb-md text-center">
      Sportski objekti
    </div>

    <!-- SEARCH INPUT ZA FILTRIRANJE OBJEKATA -->
    <q-input
      v-model="search"
      filled
      dense
      clearable
      placeholder="Pretraži po nazivu ili adresi..."
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- LOADING SPINNER DOK SE PODACI UČITAVAJU -->
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="2em" />
    </div>

    <!-- GLAVNI PRIKAZ OBJEKATA -->
    <div v-else class="row q-col-gutter-md">

      <!-- KARTICA ZA SVAKI OBJEKT -->
      <div
        v-for="obj in filteredObjects"
        :key="obj.id"
        class="col-12 col-md-6"
      >

        <q-card
          flat
          bordered
          clickable
          v-ripple
          style="cursor: pointer;"
          @click="openObjekt(obj.id || obj.ObjektID)"
        >

          <q-card-section>

            <!-- HEADER KARTICE (NAZIV + FAVORIT GUMB) -->
            <div class="row items-start justify-between">

              <!-- NAZIV OBJEKTA -->
              <div class="text-h6">{{ obj.NazivObjekta }}</div>

              <!-- FAVORIT GUMB (SAMO AKO JE USER LOGIRAN) -->
              <q-btn
                v-if="mainUser"
                round
                flat
                dense
                :icon="isFavorite(obj.id) ? 'star' : 'star_border'"
                :color="isFavorite(obj.id) ? 'orange' : 'grey'"
                @click.stop="toggleFavorite(obj.id)"
              />
            </div>

            <!-- ADRESA OBJEKTA -->
            <div class="text-grey-7 q-mt-xs">{{ obj.Adresa }}</div>

            <!-- OPIS OBJEKTA (AKO POSTOJI) -->
            <div v-if="obj.Opis" class="q-mt-sm text-body2">
              {{ obj.Opis }}
            </div>

            <!-- RATING + BROJ RECENZIJA -->
            <div class="q-mt-sm row items-center">

              <!-- QUASAR RATING KOMPONENTA -->
              <q-rating
                :model-value="getAvgRating(obj.id)"
                max="5"
                size="1.2em"
                color="orange"
                readonly
              />

              <!-- TEKSTUALNI PRIKAZ OCJENE -->
              <span class="q-ml-sm text-caption">
                {{ getAvgRating(obj.id).toFixed(1) }} / 5
                ({{ getReviewCount(obj.id) }})
              </span>
            </div>

            <!-- AKCIJSKI GUMBI -->
            <div class="q-mt-sm row q-gutter-xs">

              <!-- DUGME ZA DETALJE -->
              <q-btn
                flat
                dense
                color="primary"
                icon="info"
                label="Detalji"
                @click.stop="openObjekt(obj.id || obj.ObjektID)"
              />

              <!-- DUGME ZA STATISTIKU -->
              <q-btn
                flat
                dense
                color="primary"
                icon="bar_chart"
                label="Statistika"
                :to="`/statistika/${obj.id}`"
                @click.stop
              />
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- PRIKAZ AKO NEMA REZULTATA -->
      <div
        v-if="filteredObjects.length === 0"
        class="col-12 text-center text-grey q-pa-lg"
      >
        Nema rezultata.
      </div>

    </div>

  </q-page>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API = 'http://localhost:3000'

export default {
  name: 'PretragaObjekataPage',

  setup() {

    // GLOBALNI USER (LOGIN STATE)
    const mainUser = inject('user')

    // ROUTER ZA NAVIGACIJU
    const router = useRouter()

    // SVI SPORTSKI OBJEKTI
    const objects = ref([])

    // SVE RECENZIJE (ZA RATING)
    const reviews = ref([])

    // FAVORITI KORISNIKA
    const favorites = ref([])

    // SEARCH INPUT
    const search = ref('')

    // LOADING STATE
    const loading = ref(true)

    // UČITAVANJE FAVORITA ZA USERA
    const loadFavorites = async () => {

      // Ako user nije logiran → prazno
      if (!mainUser.value) {
        favorites.value = []
        return
      }

      try {
        const res = await fetch(`${API}/api/favoriti/${mainUser.value.id}`)
        favorites.value = await res.json()

      } catch (e) {
        console.error('Greška kod favorita:', e)
      }
    }

    // UČITAVANJE OBJEKATA I RECENZIJA
    const loadData = async () => {
      try {
        const [oRes, rRes] = await Promise.all([
          fetch(`${API}/api/objects`),
          fetch(`${API}/api/recenzije`)
        ])

        objects.value = await oRes.json()
        reviews.value = await rRes.json()

      } catch (e) {
        console.error('Greška kod učitavanja:', e)

      } finally {
        loading.value = false
      }
    }

    // INIT NA LOAD STRANICE
    onMounted(async () => {
      await loadData()
      await loadFavorites()
    })

    // VRATI RECENZIJE ZA ODREĐENI OBJEKT
    const getReviewsFor = (id) =>
      reviews.value.filter(r => r.ObjektID === id)

    // PROSJEČNA OCJENA
    const getAvgRating = (id) => {
      const rs = getReviewsFor(id)
      if (rs.length === 0) return 0

      return rs.reduce((s, r) => s + Number(r.Ocjena), 0) / rs.length
    }

    // BROJ RECENZIJA
    const getReviewCount = (id) =>
      getReviewsFor(id).length

    // FILTER OBJEKATA PREMA SEARCHU
    const filteredObjects = computed(() => {
      const q = (search.value || '').toLowerCase().trim()

      if (!q) return objects.value

      return objects.value.filter(o =>
        (o.NazivObjekta || '').toLowerCase().includes(q) ||
        (o.Adresa || '').toLowerCase().includes(q) ||
        (o.Opis || '').toLowerCase().includes(q)
      )
    })

    // PROVJERA FAVORITA
    const isFavorite = (id) =>
      favorites.value.some(f => f.ObjektID === id)

    // DODAJ / UKLONI FAVORITE
    const toggleFavorite = async (id) => {

      if (!mainUser.value) return

      const body = {
        KorisnikID: mainUser.value.id,
        ObjektID: id
      }

      try {
        if (isFavorite(id)) {
          await fetch(`${API}/api/favoriti`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
        } else {
          await fetch(`${API}/api/favoriti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
        }

        await loadFavorites()

      } catch (e) {
        console.error('Greška kod favorita:', e)
      }
    }

    // OTVORI DETALJE OBJEKTA
    const openObjekt = (id) => {
      router.push(`/objekti/${id}`)
    }

    return {
      mainUser,
      search,
      loading,
      filteredObjects,
      getAvgRating,
      getReviewCount,
      isFavorite,
      toggleFavorite,
      openObjekt
    }
  }
}
</script>

<style scoped>
/* jednostavan spacing i layout za kartice */
</style>

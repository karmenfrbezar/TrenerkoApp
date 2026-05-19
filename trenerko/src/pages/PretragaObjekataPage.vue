<template>
  <q-page class="q-pa-md">

    <div class="text-h5 text-primary q-mb-md text-center">
      Sportski objekti
    </div>

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

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="2em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="obj in filteredObjects"
        :key="obj.id"
        class="col-12 col-md-6"
      >
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-start justify-between">
              <div class="text-h6">{{ obj.NazivObjekta }}</div>
              <q-btn
                v-if="mainUser"
                round
                flat
                dense
                :icon="isFavorite(obj.id) ? 'star' : 'star_border'"
                :color="isFavorite(obj.id) ? 'orange' : 'grey'"
                @click="toggleFavorite(obj.id)"
              />
            </div>

            <div class="text-grey-7 q-mt-xs">{{ obj.Adresa }}</div>

            <div v-if="obj.Opis" class="q-mt-sm text-body2">
              {{ obj.Opis }}
            </div>

            <div class="q-mt-sm row items-center">
              <q-rating
                :model-value="getAvgRating(obj.id)"
                max="5"
                size="1.2em"
                color="orange"
                readonly
              />
              <span class="q-ml-sm text-caption">
                {{ getAvgRating(obj.id).toFixed(1) }} / 5
                ({{ getReviewCount(obj.id) }})
              </span>
            </div>

            <div class="q-mt-sm">
              <q-btn
                flat
                dense
                color="primary"
                icon="bar_chart"
                label="Statistika"
                :to="`/statistika/${obj.id}`"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

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

const API = 'http://localhost:3000'

export default {
  name: 'PretragaObjekataPage',
  setup() {
    const mainUser = inject('user')
    const objects = ref([])
    const reviews = ref([])
    const favorites = ref([])
    const search = ref('')
    const loading = ref(true)

    const loadFavorites = async () => {
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

    onMounted(async () => {
      await loadData()
      await loadFavorites()
    })

    const getReviewsFor = (id) =>
      reviews.value.filter(r => r.ObjektID === id)

    const getAvgRating = (id) => {
      const rs = getReviewsFor(id)
      if (rs.length === 0) return 0
      return rs.reduce((s, r) => s + Number(r.Ocjena), 0) / rs.length
    }

    const getReviewCount = (id) => getReviewsFor(id).length

    const filteredObjects = computed(() => {
      const q = (search.value || '').toLowerCase().trim()
      if (!q) return objects.value
      return objects.value.filter(o =>
        (o.NazivObjekta || '').toLowerCase().includes(q) ||
        (o.Adresa || '').toLowerCase().includes(q) ||
        (o.Opis || '').toLowerCase().includes(q)
      )
    })

    const isFavorite = (id) => favorites.value.some(f => f.ObjektID === id)

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

    return {
      mainUser,
      search,
      loading,
      filteredObjects,
      getAvgRating,
      getReviewCount,
      isFavorite,
      toggleFavorite
    }
  }
}
</script>
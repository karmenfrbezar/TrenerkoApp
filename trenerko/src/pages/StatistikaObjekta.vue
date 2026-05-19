<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>

      <q-card-section class="bg-orange-6 text-white">
        <div class="text-h6">
          Statistika objekta — {{ selectedObject?.NazivObjekta || '—' }}
        </div>
      </q-card-section>

      <q-card-section v-if="objects.length > 0">

        <!-- 4 box-a -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div v-for="s in summaryStats" :key="s.label" class="col-6 col-sm-3">
            <q-card flat bordered class="text-center q-pa-md bg-orange-1">
              <div class="text-caption text-grey-8">{{ s.label }}</div>
              <div class="text-h6 text-orange-9">{{ s.value }}</div>
            </q-card>
          </div>
        </div>

        <!-- Trend recenzija -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 q-mb-sm">Trend broja recenzija (zadnjih 6 mj.):</div>
          <q-card flat bordered class="q-pa-md">
            <svg viewBox="0 0 600 200" style="width: 100%; height: 200px;">
              <polyline
                :points="trendPoints"
                fill="none"
                stroke="#fb8c00"
                stroke-width="3"
              />
              <g v-for="(p, i) in trendData" :key="i">
                <circle :cx="getX(i)" :cy="getY(p.count)" r="5" fill="#fb8c00" />
                <text :x="getX(i)" y="190" text-anchor="middle" font-size="14" fill="#666">
                  {{ p.label }}
                </text>
                <text :x="getX(i)" :y="getY(p.count) - 10" text-anchor="middle" font-size="13" fill="#333">
                  {{ p.count }}
                </text>
              </g>
            </svg>
          </q-card>
        </div>

        <!-- Selektor -->
        <div class="row items-center">
          <div class="q-mr-md text-body1">Odaberi objekt:</div>
          <q-select
            v-model="selectedId"
            :options="objectOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            style="min-width: 280px;"
          />
        </div>

      </q-card-section>

      <q-card-section v-else class="text-center q-pa-lg">
        <q-spinner color="orange" size="2em" />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API = 'http://localhost:3000'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const objects = ref([])
    const reviews = ref([])
    const selectedId = ref(null)

    const loadData = async () => {
      try {
        const [oRes, rRes] = await Promise.all([
          fetch(`${API}/api/objects`),
          fetch(`${API}/api/recenzije`)
        ])
        objects.value = await oRes.json()
        reviews.value = await rRes.json()

        const urlId = Number(route.params.id)
        if (urlId && objects.value.find(o => o.id === urlId)) {
          selectedId.value = urlId
        } else if (objects.value.length > 0) {
          selectedId.value = objects.value[0].id
        }
      } catch (e) {
        console.error('Greška:', e)
      }
    }

    onMounted(loadData)

    watch(selectedId, (newId) => {
      if (newId && Number(route.params.id) !== newId) {
        router.replace(`/statistika/${newId}`)
      }
    })

    watch(() => route.params.id, (newId) => {
      const n = Number(newId)
      if (n && objects.value.find(o => o.id === n)) {
        selectedId.value = n
      }
    })

    const selectedObject = computed(() =>
      objects.value.find(o => o.id === selectedId.value)
    )

    const objectReviews = computed(() =>
      reviews.value.filter(r => r.ObjektID === selectedId.value)
    )

    const avgRating = computed(() => {
      const rs = objectReviews.value
      if (rs.length === 0) return 0
      return rs.reduce((s, r) => s + Number(r.Ocjena), 0) / rs.length
    })

    const summaryStats = computed(() => [
      { label: 'Recenzije', value: objectReviews.value.length },
      { label: 'Pr. ocjena', value: `${avgRating.value.toFixed(1)} / 5` },
      { label: 'Favoriti', value: '—' },
      { label: 'Događaji', value: '—' }
    ])

    const trendData = computed(() => {
      const months = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const label = d.toLocaleDateString('hr-HR', { month: 'short' })
        const count = objectReviews.value.filter(r => {
          const rd = new Date(r.DatumObjave)
          return `${rd.getFullYear()}-${rd.getMonth()}` === key
        }).length
        months.push({ label, count })
      }
      return months
    })

    const maxCount = computed(() =>
      Math.max(1, ...trendData.value.map(p => p.count))
    )

    const getX = (i) => 50 + i * 100
    const getY = (count) => 160 - (count / maxCount.value) * 130

    const trendPoints = computed(() =>
      trendData.value.map((p, i) => `${getX(i)},${getY(p.count)}`).join(' ')
    )

    const objectOptions = computed(() =>
      objects.value.map(o => ({ id: o.id, label: o.NazivObjekta }))
    )

    return {
      objects,
      selectedId,
      selectedObject,
      summaryStats,
      trendData,
      trendPoints,
      getX,
      getY,
      objectOptions
    }
  }
}
</script>
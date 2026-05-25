<template>
  <q-page class="q-pa-md">

    <div class="text-h5 text-primary q-mb-md text-center">
      Događaji
    </div>

    <!-- FILTERI -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6">
        <q-select
          v-model="filterSport"
          :options="sportOpcije"
          label="Sport"
          dense
          outlined
          clearable
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input
          v-model="filterDatum"
          label="Datum (od)"
          type="date"
          dense
          outlined
          clearable
        />
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="2em" />
    </div>

    <!-- LISTA DOGADAJA -->
    <div v-else>
      <div v-if="filtrirani.length === 0" class="text-center text-grey q-pa-xl">
        Nema događaja za odabrane filtere.
      </div>

      <q-card
        v-for="ev in filtrirani"
        :key="ev.DogadajID"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section>
          <div class="row items-start justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ ev.NazivDogadaja }}</div>
              <div class="text-grey-7 text-caption q-mt-xs">
                {{ formatDate(ev.DatumDogadaja) }}
              </div>
              <div class="text-grey-7 text-caption">
                📍 {{ ev.NazivObjekta }}
              </div>
              <div v-if="ev.OpisDogadaja" class="text-body2 q-mt-xs">
                {{ ev.OpisDogadaja }}
              </div>
            </div>
            <div class="column items-end q-gutter-xs">
              <q-badge
                :color="ev.Status === 'Aktivan' ? 'green' : 'grey'"
                :label="ev.Status"
              />
              <q-btn
                flat
                dense
                color="primary"
                label="Detalji"
                size="sm"
                :to="`/objekti/${ev.ObjektID}`"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

const API = 'http://localhost:3000'

export default {
  name: 'DogadajiPage',
  setup() {
    const dogadaji = ref([])
    const loading = ref(true)
    const filterSport = ref(null)
    const filterDatum = ref('')

    const ucitaj = async () => {
      try {
        const res = await fetch(`${API}/api/dogadjaji`)
        dogadaji.value = await res.json()
      } catch (e) {
        console.error('Greška:', e)
      } finally {
        loading.value = false
      }
    }

    onMounted(ucitaj)

    // izvuci unique nazive objekata za filter
    const sportOpcije = computed(() => {
      const nazivi = [...new Set(dogadaji.value.map(d => d.NazivObjekta))]
      return nazivi.map(n => ({ label: n, value: n }))
    })

    const filtrirani = computed(() => {
      return dogadaji.value.filter(ev => {
        const sportOk = !filterSport.value || ev.NazivObjekta === filterSport.value
        const datumOk = !filterDatum.value || new Date(ev.DatumDogadaja) >= new Date(filterDatum.value)
        return sportOk && datumOk
      })
    })

    const formatDate = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleString('hr-HR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }

    return {
      loading,
      filtrirani,
      sportOpcije,
      filterSport,
      filterDatum,
      formatDate
    }
  }
}
</script>
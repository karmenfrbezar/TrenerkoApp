<template>
  <q-page class="q-pa-md">

    <!-- NASLOV STRANICE -->
    <div class="text-h5 text-primary q-mb-md text-center">
      Događaji
    </div>

    <!-- =====================================================
         FILTERI ZA PRETRAGU DOGAĐAJA
         - filtriranje po objektu/sportu
         - filtriranje od određenog datuma
    ====================================================== -->
    <div class="row q-col-gutter-sm q-mb-md">

      <!-- FILTER PO OBJEKTU -->
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

      <!-- FILTER PO DATUMU -->
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

    <!-- LOADER TIJEKOM UČITAVANJA PODATAKA -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="2em" />
    </div>

    <!-- =====================================================
         LISTA DOGAĐAJA
    ====================================================== -->
    <div v-else>

      <!-- Poruka ako nema rezultata -->
      <div v-if="filtrirani.length === 0" class="text-center text-grey q-pa-xl">
        Nema događaja za odabrane filtere.
      </div>

      <!-- Prikaz svakog događaja -->
      <q-card
        v-for="ev in filtrirani"
        :key="ev.DogadajID"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section>

          <div class="row items-start justify-between">

            <!-- Osnovni podaci događaja -->
            <div>

              <!-- Naziv događaja -->
              <div class="text-subtitle1 text-weight-bold">
                {{ ev.NazivDogadaja }}
              </div>

              <!-- Datum i vrijeme -->
              <div class="text-grey-7 text-caption q-mt-xs">
                {{ formatDate(ev.DatumDogadaja) }}
              </div>

              <!-- Naziv objekta -->
              <div class="text-grey-7 text-caption">
                📍 {{ ev.NazivObjekta }}
              </div>

              <!-- Opis događaja -->
              <div
                v-if="ev.OpisDogadaja"
                class="text-body2 q-mt-xs"
              >
                {{ ev.OpisDogadaja }}
              </div>

            </div>

            <!-- Status i detalji -->
            <div class="column items-end q-gutter-xs">

              <!-- Status događaja -->
              <q-badge
                :color="ev.Status === 'Aktivan' ? 'green' : 'grey'"
                :label="ev.Status"
              />

              <!-- Odlazak na detalje objekta -->
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

// Backend API adresa
const API = 'http://localhost:3000'

export default {
  name: 'DogadajiPage',

  setup() {

    // =====================================================
    // REAKTIVNI PODACI
    // =====================================================

    // Lista svih događaja
    const dogadaji = ref([])

    // Prikaz loadera tijekom učitavanja
    const loading = ref(true)

    // Trenutno odabrani objekt/sport
    const filterSport = ref(null)

    // Datum od kojeg prikazujemo događaje
    const filterDatum = ref('')



    // =====================================================
    // DOHVAĆANJE DOGAĐAJA S BACKENDA
    // =====================================================
    const ucitaj = async () => {
      try {

        // Dohvati događaje iz API-ja
        const res = await fetch(`${API}/api/dogadjaji`)

        // Spremi rezultate
        dogadaji.value = await res.json()

      } catch (e) {

        console.error('Greška:', e)

      } finally {

        // Sakrij loader
        loading.value = false
      }
    }



    // =====================================================
    // POZIVA SE PRI UČITAVANJU STRANICE
    // =====================================================
    onMounted(ucitaj)



    // =====================================================
    // COMPUTED - OPCIJE ZA FILTER
    //
    // Izvlači jedinstvene nazive objekata
    // kako bi se prikazali u q-select komponenti
    // =====================================================
    const sportOpcije = computed(() => {

      const nazivi = [
        ...new Set(
          dogadaji.value.map(d => d.NazivObjekta)
        )
      ]

      return nazivi.map(n => ({
        label: n,
        value: n
      }))
    })



    // =====================================================
    // COMPUTED - FILTRIRANJE DOGAĐAJA
    //
    // Filtrira:
    // 1. po objektu
    // 2. po datumu
    // =====================================================
    const filtrirani = computed(() => {

      return dogadaji.value.filter(ev => {

        const sportOk =
          !filterSport.value ||
          ev.NazivObjekta === filterSport.value

        const datumOk =
          !filterDatum.value ||
          new Date(ev.DatumDogadaja) >= new Date(filterDatum.value)

        return sportOk && datumOk
      })
    })



    // =====================================================
    // FORMATIRANJE DATUMA
    //
    // ISO datum -> hrvatski format
    // =====================================================
    const formatDate = (iso) => {

      if (!iso) return '—'

      return new Date(iso).toLocaleString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }



    // =====================================================
    // VARIJABLE I FUNKCIJE DOSTUPNE TEMPLATE-U
    // =====================================================
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

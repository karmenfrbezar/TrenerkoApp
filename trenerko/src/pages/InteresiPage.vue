<template>

  <!-- =====================================================
       STRANICA INTERESA
       Korisnik odabire sportove koji ga zanimaju.
       Interesi se spremaju u bazu i koriste za
       personalizaciju sadržaja.
  ====================================================== -->

  <q-page class="q-pa-md flex flex-center">

    <!-- Glavna kartica -->
    <q-card flat bordered style="width: 500px; max-width: 95%;">

      <!-- Zaglavlje -->
      <q-card-section class="bg-green-6 text-white text-center">
        <div class="text-h6">Moji interesi (Sportovi)</div>
        <div class="text-caption">
          Odaberi sportove koji te zanimaju
        </div>
      </q-card-section>

      <!-- Korisnik nije prijavljen -->
      <q-card-section
        v-if="!mainUser"
        class="text-center text-grey q-pa-lg"
      >
        Prijavi se da bi upravljao interesima.
      </q-card-section>

      <!-- Loader tijekom učitavanja -->
      <q-card-section
        v-else-if="loading"
        class="text-center q-pa-lg"
      >
        <q-spinner color="green" size="2em" />
      </q-card-section>

      <!-- =====================================================
           LISTA SPORTOVA
      ====================================================== -->
      <q-card-section v-else>

        <div class="row q-col-gutter-sm q-mb-md">

          <!-- Prikaz svakog sporta -->
          <div
            v-for="sport in sviSportovi"
            :key="sport.SportID"
            class="col-12"
          >

            <!-- Klikabilna stavka sporta -->
            <q-item
              clickable
              v-ripple
              :class="jeOdabran(sport.SportID) ? 'bg-green-1' : ''"
              style="border-radius: 8px; border: 1px solid #e0e0e0;"
              class="q-mb-xs"
              @click="toggleInteres(sport.SportID)"
            >

              <!-- Naziv sporta -->
              <q-item-section>
                <q-item-label>
                  {{ sport.NazivSporta }}
                </q-item-label>
              </q-item-section>

              <!-- Checkbox za odabir -->
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

        <!-- Ako nema sportova -->
        <div
          v-if="sviSportovi.length === 0"
          class="text-center text-grey q-pa-md"
        >
          Nema dostupnih sportova.
        </div>

        <!-- Spremanje interesa -->
        <q-btn
          unelevated
          color="green"
          label="Spremi interese"
          class="full-width q-mt-sm"
          :loading="saving"
          @click="spremiInterese"
        />

        <!-- Poruka uspjeha ili greške -->
        <div
          v-if="poruka"
          class="text-center q-mt-md"
          :class="porukaGreska ? 'text-red' : 'text-green'"
        >
          {{ poruka }}
        </div>

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

// Backend API adresa
const API = 'http://localhost:3000'

export default {
  name: 'InteresiPage',

  setup() {

    // =====================================================
    // PRIJAVLJENI KORISNIK
    // =====================================================
    const mainUser = inject('user')



    // =====================================================
    // REAKTIVNI PODACI
    // =====================================================

    // Svi dostupni sportovi
    const sviSportovi = ref([])

    // ID-jevi sportova koje je korisnik odabrao
    const mojInteresi = ref([])

    // Loader za početno učitavanje
    const loading = ref(true)

    // Loader za spremanje interesa
    const saving = ref(false)

    // Poruka korisniku
    const poruka = ref('')

    // Označava je li poruka greška
    const porukaGreska = ref(false)



    // =====================================================
    // UČITAVANJE PODATAKA
    //
    // 1. Dohvaća sve sportove
    // 2. Dohvaća korisnikove interese
    // =====================================================
    const ucitaj = async () => {

      if (!mainUser.value) {
        loading.value = false
        return
      }

      try {

        const [sRes, iRes] = await Promise.all([

          // Lista svih sportova
          fetch(`${API}/api/sportovi`),

          // Korisnikovi interesi
          fetch(`${API}/api/interesi/${mainUser.value.id}`)
        ])

        sviSportovi.value = await sRes.json()

        const interesi = await iRes.json()

        // Sprema samo SportID vrijednosti
        mojInteresi.value = interesi.map(i => i.SportID)

      } catch (err) {

        console.error('Greška:', err)

      } finally {

        loading.value = false
      }
    }



    // =====================================================
    // POZIVA SE PRI UČITAVANJU STRANICE
    // =====================================================
    onMounted(ucitaj)



    // =====================================================
    // PROVJERAVA JE LI SPORT ODABRAN
    // =====================================================
    const jeOdabran = (sportId) =>
      mojInteresi.value.includes(sportId)



    // =====================================================
    // DODAVANJE / UKLANJANJE INTERESA
    //
    // Ako je sport već odabran -> ukloni ga
    // Ako nije -> dodaj ga
    // =====================================================
    const toggleInteres = (sportId) => {

      if (jeOdabran(sportId)) {

        mojInteresi.value =
          mojInteresi.value.filter(id => id !== sportId)

      } else {

        mojInteresi.value = [
          ...mojInteresi.value,
          sportId
        ]
      }
    }



    // =====================================================
    // SPREMANJE INTERESA
    //
    // Šalje listu odabranih sportova backendu
    // =====================================================
    const spremiInterese = async () => {

      saving.value = true
      poruka.value = ''

      try {

        await fetch(
          `${API}/api/interesi/${mainUser.value.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              sportovi: mojInteresi.value
            })
          }
        )

        poruka.value =
          'Interesi uspješno spremljeni!'

        porukaGreska.value = false

      } catch {

        poruka.value =
          'Greška pri spremanju.'

        porukaGreska.value = true

      } finally {

        saving.value = false
      }
    }



    // =====================================================
    // PODACI I FUNKCIJE DOSTUPNE TEMPLATE-U
    // =====================================================
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

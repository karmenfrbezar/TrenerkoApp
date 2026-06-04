<template>

  <!-- =====================================================
       STRANICA FAVORITA
       Prikazuje objekte koje je korisnik označio
       kao favorite te omogućuje njihovo uklanjanje.
  ====================================================== -->

  <q-page class="q-pa-md flex flex-center">

    <!-- Glavna kartica -->
    <q-card flat bordered style="width: 500px; max-width: 95%;">

      <!-- Zaglavlje stranice -->
      <q-card-section class="bg-orange-6 text-white text-center">
        <div class="text-h6">Moji favoriti</div>
      </q-card-section>

      <!-- Korisnik nije prijavljen -->
      <q-card-section
        v-if="!mainUser"
        class="text-center text-grey q-pa-lg"
      >
        Prijavi se da bi vidio favorite.
      </q-card-section>

      <!-- Loader tijekom dohvaćanja favorita -->
      <q-card-section
        v-else-if="loading"
        class="text-center q-pa-lg"
      >
        <q-spinner color="orange" size="2em" />
      </q-card-section>

      <!-- Nema spremljenih favorita -->
      <q-card-section
        v-else-if="favorites.length === 0"
        class="text-center text-grey q-pa-lg"
      >
        Još nema favorita.
      </q-card-section>

      <!-- =====================================================
           LISTA FAVORITA
      ====================================================== -->
      <q-card-section v-else>

        <!-- Prikaz svakog favorita -->
        <q-card
          v-for="fav in favorites"
          :key="fav.FavoritID"
          flat
          bordered
          class="q-mb-md"
        >

          <q-card-section class="row items-center justify-between">

            <!-- Podaci o objektu -->
            <div>

              <!-- Naziv objekta -->
              <div class="text-subtitle1 text-weight-bold">
                {{ fav.NazivObjekta }}
              </div>

              <!-- Adresa objekta -->
              <div class="text-grey-7 text-body2">
                {{ fav.Adresa }}
              </div>

              <!-- Datum dodavanja u favorite -->
              <div class="text-grey-6 text-caption q-mt-xs">
                Dodano: {{ formatDate(fav.DatumDodavanja) }}
              </div>

            </div>

            <!-- Uklanjanje favorita -->
            <q-btn
              outline
              color="red"
              label="Ukloni"
              size="sm"
              @click="removeFavorite(fav.ObjektID)"
            />

          </q-card-section>
        </q-card>

        <!-- Ukupan broj favorita -->
        <div class="text-grey-7 q-mt-md">
          Ukupno favorita: {{ favorites.length }}
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
  name: 'FavoritiPage',

  setup() {

    // =====================================================
    // PRIJAVLJENI KORISNIK
    // Dohvaća se preko provide/inject mehanizma
    // =====================================================
    const mainUser = inject('user')



    // =====================================================
    // REAKTIVNI PODACI
    // =====================================================

    // Lista korisnikovih favorita
    const favorites = ref([])

    // Loader tijekom dohvaćanja podataka
    const loading = ref(true)



    // =====================================================
    // DOHVAĆANJE FAVORITA IZ BAZE
    // =====================================================
    const loadFavorites = async () => {

      // Ako korisnik nije prijavljen
      if (!mainUser.value) {
        loading.value = false
        return
      }

      try {

        // Dohvaćanje favorita za prijavljenog korisnika
        const res = await fetch(
          `${API}/api/favoriti/${mainUser.value.id}`
        )

        // Spremanje rezultata
        favorites.value = await res.json()

      } catch (e) {

        console.error('Greška:', e)

      } finally {

        // Sakrivanje loadera
        loading.value = false
      }
    }



    // =====================================================
    // POZIVA SE PRI UČITAVANJU STRANICE
    // =====================================================
    onMounted(loadFavorites)



    // =====================================================
    // UKLANJANJE FAVORITA
    //
    // 1. Šalje DELETE zahtjev
    // 2. Briše favorit iz lokalne liste
    // =====================================================
    const removeFavorite = async (objektId) => {

      try {

        await fetch(`${API}/api/favoriti`, {

          method: 'DELETE',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            KorisnikID: mainUser.value.id,
            ObjektID: objektId
          })
        })

        // Uklanjanje iz prikaza bez ponovnog učitavanja
        favorites.value = favorites.value.filter(
          f => f.ObjektID !== objektId
        )

      } catch (e) {

        console.error('Greška:', e)
      }
    }



    // =====================================================
    // FORMATIRANJE DATUMA
    //
    // ISO datum -> hrvatski format
    // =====================================================
    const formatDate = (iso) => {

      if (!iso) return '—'

      const d = new Date(iso)

      return d.toLocaleDateString('hr-HR')
    }



    // =====================================================
    // VARIJABLE I FUNKCIJE DOSTUPNE TEMPLATE-U
    // =====================================================
    return {
      mainUser,
      loading,
      favorites,
      removeFavorite,
      formatDate
    }
  }
}
</script>

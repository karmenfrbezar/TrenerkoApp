<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card flat bordered style="width: 500px; max-width: 95%;">

      <q-card-section class="bg-orange-6 text-white text-center">
        <div class="text-h6">Moji favoriti</div>
      </q-card-section>

      <q-card-section v-if="!mainUser" class="text-center text-grey q-pa-lg">
        Prijavi se da bi vidio favorite.
      </q-card-section>

      <q-card-section v-else-if="loading" class="text-center q-pa-lg">
        <q-spinner color="orange" size="2em" />
      </q-card-section>

      <q-card-section v-else-if="favorites.length === 0" class="text-center text-grey q-pa-lg">
        Još nema favorita.
      </q-card-section>

      <q-card-section v-else>
        <q-card
          v-for="fav in favorites"
          :key="fav.FavoritID"
          flat
          bordered
          class="q-mb-md"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">
                {{ fav.NazivObjekta }}
              </div>
              <div class="text-grey-7 text-body2">{{ fav.Adresa }}</div>
              <div class="text-grey-6 text-caption q-mt-xs">
                Dodano: {{ formatDate(fav.DatumDodavanja) }}
              </div>
            </div>
            <q-btn
              outline
              color="red"
              label="Ukloni"
              size="sm"
              @click="removeFavorite(fav.ObjektID)"
            />
          </q-card-section>
        </q-card>

        <div class="text-grey-7 q-mt-md">
          Ukupno favorita: {{ favorites.length }}
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

const API = 'http://localhost:3000'

export default {
  name: 'FavoritiPage',
  setup() {
    const mainUser = inject('user')
    const favorites = ref([])
    const loading = ref(true)

    const loadFavorites = async () => {
      if (!mainUser.value) {
        loading.value = false
        return
      }
      try {
        const res = await fetch(`${API}/api/favoriti/${mainUser.value.id}`)
        favorites.value = await res.json()
      } catch (e) {
        console.error('Greška:', e)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadFavorites)

    const removeFavorite = async (objektId) => {
      try {
        await fetch(`${API}/api/favoriti`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            KorisnikID: mainUser.value.id,
            ObjektID: objektId
          })
        })
        favorites.value = favorites.value.filter(f => f.ObjektID !== objektId)
      } catch (e) {
        console.error('Greška:', e)
      }
    }

    const formatDate = (iso) => {
      if (!iso) return '—'
      const d = new Date(iso)
      return d.toLocaleDateString('hr-HR')
    }

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
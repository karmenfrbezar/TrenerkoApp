<template>
  <!-- Cijela stranica - centrira karticu vertikalno i horizontalno -->
  <div class="flex flex-center" style="min-height:100vh; background: #f5f4f0;">

    <!-- Glavna kartica login forme -->
    <q-card flat bordered style="width:360px; max-width:92%; padding: 2rem 2rem 1.75rem; border-radius: 12px;">

      <!-- Zaglavlje: avatar + naslov + podnaslov -->
      <div class="text-center q-mb-lg">
        <q-avatar size="48px" color="deep-purple-1" text-color="deep-purple" icon="person" class="q-mb-sm" />
        <div class="text-h6" style="font-weight: 500;">Dobrodošli nazad</div>
        <div class="text-caption text-grey-6">Prijavite se na svoj račun</div>
      </div>

      <!-- Email input sekcija -->
      <div class="q-mb-md">
        <!-- Label iznad inputa -->
        <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Email adresa</div>

        <!-- Quasar input za email -->
        <q-input
          v-model="email"
          outlined
          dense
          placeholder="vas@email.com"
          type="email"
        >
          <!-- Ikona lijevo u inputu -->
          <template #prepend>
            <q-icon name="mail" size="16px" color="grey-5" />
          </template>
        </q-input>
      </div>

      <!-- Password input sekcija -->
      <div class="q-mb-lg">
        <!-- Header za password + link za reset -->
        <div class="row justify-between items-center q-mb-xs">
          <span class="text-caption text-weight-medium text-grey-7">Lozinka</span>

          <!-- Link za reset lozinke -->
          <a href="#" class="text-caption text-deep-purple-8" style="text-decoration:none;">
            Zaboravili ste lozinku?
          </a>
        </div>

        <!-- Quasar input za lozinku -->
        <q-input
          v-model="password"
          outlined
          dense
          placeholder="••••••••"
          :type="showPassword ? 'text' : 'password'"
        >
          <!-- Lock ikona lijevo -->
          <template #prepend>
            <q-icon name="lock" size="16px" color="grey-5" />
          </template>

          <!-- Toggle visibility ikona desno -->
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              size="16px"
              color="grey-5"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>

      <!-- Login button -->
      <q-btn
        unelevated
        color="deep-purple"
        label="Prijavi se"
        icon="login"
        class="full-width"
        style="border-radius: 8px; font-weight: 500;"
        @click="login"
      />

      <!-- Poruka greške (validacija / backend error) -->
      <div v-if="message" class="text-red text-caption text-center q-mt-md">
        <q-icon name="error_outline" size="14px" />
        {{ message }}
      </div>

      <!-- Separator linija -->
      <q-separator class="q-my-md" />

      <!-- Link na registraciju -->
      <div class="text-center text-caption text-grey-6">
        Nemate račun?
        <router-link
          to="/register"
          class="text-deep-purple-8"
          style="text-decoration:none; font-weight:500;"
        >
          Registrirajte se
        </router-link>
      </div>

    </q-card>
  </div>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    // Globalni user state (provide/inject iz parent aplikacije)
    const mainUser = inject('user')

    // Router za navigaciju nakon uspješne prijave
    const router = useRouter()

    // Reaktivni state za input polja
    const email = ref('')
    const password = ref('')
    const message = ref('')

    // Kontrola prikaza lozinke (show/hide)
    const showPassword = ref(false)

    // Login funkcija koja se poziva na klik gumba
    const login = () => {

      // Frontend validacija - provjera praznih polja
      if (!email.value || !password.value) {
        message.value = "Sva polja su obavezna"
        return
      }

      // HTTP POST zahtjev prema backend API-ju
      fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          lozinka: password.value
        })
      })
        .then(res => res.json())
        .then(data => {

          // Ako backend vrati error poruku
          if (data.error) {
            message.value = data.error
            return
          }

          // Spremanje user podataka u globalni state
          mainUser.value = {
            id: data.id,
            email: data.email,
            ime: data.ime,
            prezime: data.prezime,
            spol: data.spol,
            role: data.role,
            status: data.status
          }

          // Redirect na homepage nakon uspješne prijave
          router.push('/')
        })
        .catch(() => {
          // Handle network/server error
          message.value = "Greška prilikom prijave"
        })
    }

    // Export u template
    return { email, password, message, showPassword, login }
  }
}
</script>

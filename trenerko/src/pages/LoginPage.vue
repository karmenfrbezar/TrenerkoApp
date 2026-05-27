<template>
  <!-- Cijela stranica - centrira karticu vertikalno i horizontalno -->
  <div class="flex flex-center" style="min-height:100vh; background: #f5f4f0;">

    <!-- Glavna kartica login forme -->
    <q-card flat bordered style="width:360px; max-width:92%; padding: 2rem 2rem 1.75rem; border-radius: 12px;">

      <!-- Zaglavlje s avatarm, naslovom i podnaslovom -->
      <div class="text-center q-mb-lg">
        <q-avatar size="48px" color="deep-purple-1" text-color="deep-purple" icon="person" class="q-mb-sm" />
        <div class="text-h6" style="font-weight: 500;">Dobrodošli nazad</div>
        <div class="text-caption text-grey-6">Prijavite se na svoj račun</div>
      </div>

      <!-- Polje za unos email adrese -->
      <div class="q-mb-md">
        <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Email adresa</div>
        <q-input v-model="email" outlined dense placeholder="vas@email.com" type="email">
          <template #prepend><q-icon name="mail" size="16px" color="grey-5" /></template>
        </q-input>
      </div>

      <!-- Polje za unos lozinke s linkom za reset i toggle vidljivosti -->
      <div class="q-mb-lg">
        <div class="row justify-between items-center q-mb-xs">
          <span class="text-caption text-weight-medium text-grey-7">Lozinka</span>
          <a href="#" class="text-caption text-deep-purple-8" style="text-decoration:none;">Zaboravili ste lozinku?</a>
        </div>
        <q-input v-model="password" outlined dense placeholder="••••••••"
          :type="showPassword ? 'text' : 'password'">
          <template #prepend><q-icon name="lock" size="16px" color="grey-5" /></template>
          <template #append>
            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="16px"
              color="grey-5" class="cursor-pointer" @click="showPassword = !showPassword" />
          </template>
        </q-input>
      </div>

      <!-- Gumb koji poziva login funkciju -->
      <q-btn
        unelevated color="deep-purple"
        label="Prijavi se" icon="login"
        class="full-width" style="border-radius: 8px; font-weight: 500;"
        @click="login"
      />

      <!-- Prikaz greške ako login nije uspio ili polja nisu ispunjena -->
      <div v-if="message" class="text-red text-caption text-center q-mt-md">
        <q-icon name="error_outline" size="14px" /> {{ message }}
      </div>

      <q-separator class="q-my-md" />

      <!-- Link na stranicu za registraciju -->
      <div class="text-center text-caption text-grey-6">
        Nemate račun?
        <router-link to="/register" class="text-deep-purple-8" style="text-decoration:none; font-weight:500;">
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
    // Globalni user objekt koji se dijeli kroz aplikaciju (provide/inject)
    const mainUser = inject('user')

    // Router za navigaciju nakon uspješne prijave
    const router = useRouter()

    // Reaktivne varijable vezane uz input polja
    const email = ref('')
    const password = ref('')
    const message = ref('')

    // Kontrolira vidljivost lozinke (show/hide toggle)
    const showPassword = ref(false)

    // Funkcija koja se poziva klikom na "Prijavi se"
    const login = () => {

      // Provjera jesu li sva polja ispunjena
      if (!email.value || !password.value) {
        message.value = "Sva polja su obavezna"
        return
      }

      // API poziv prema backendu za autentikaciju
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

          // Ako backend vrati grešku, prikaži je korisniku
          if (data.error) {
            message.value = data.error
            return
          }

          // Spremi korisničke podatke u globalni state
          mainUser.value = {
            id: data.id,
            email: data.email,
            ime: data.ime,
            prezime: data.prezime,
            spol: data.spol,
            role: data.role,
            status: data.status
          }

          // Preusmjeri na početnu stranicu
          router.push('/')
        })
        .catch(() => {
          // Greška mreže ili server nije dostupan
          message.value = "Greška prilikom prijave"
        })
    }

    return { email, password, message, showPassword, login }
  }
}
</script>

<template>
  <!-- CIJELA STRANICA - CENTRIRANJE FORME -->
  <div class="flex flex-center" style="min-height:100vh; background: #f5f4f0;">

    <!-- GLAVNA KARTICA REGISTRACIJE -->
    <q-card flat bordered style="width:380px; max-width:92%; padding: 2rem 2rem 1.75rem; border-radius: 12px;">

      <!-- HEADER FORME -->
      <div class="text-center q-mb-lg">
        <q-avatar size="48px" color="deep-purple-1" text-color="deep-purple" icon="person_add" class="q-mb-sm" />
        <div class="text-h6" style="font-weight: 500;">Kreirajte račun</div>
        <div class="text-caption text-grey-6">Ispunite podatke za registraciju</div>
      </div>

      <!-- IME I PREZIME (2 KOLONE) -->
      <div class="row q-col-gutter-sm q-mb-md">

        <!-- IME -->
        <div class="col-6">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Ime</div>
          <q-input v-model="ime" outlined dense placeholder="Ana">
            <template #prepend>
              <q-icon name="person" size="16px" color="grey-5" />
            </template>
          </q-input>
        </div>

        <!-- PREZIME -->
        <div class="col-6">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Prezime</div>
          <q-input v-model="prezime" outlined dense placeholder="Horvat">
            <template #prepend>
              <q-icon name="person" size="16px" color="grey-5" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- EMAIL -->
      <div class="q-mb-md">
        <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Email adresa</div>

        <q-input v-model="email" outlined dense placeholder="vas@email.com" type="email">
          <template #prepend>
            <q-icon name="mail" size="16px" color="grey-5" />
          </template>
        </q-input>
      </div>

      <!-- LOZINKA + POTVRDA -->
      <div class="row q-col-gutter-sm q-mb-md">

        <!-- LOZINKA -->
        <div class="col-6">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Lozinka</div>

          <q-input
            v-model="password"
            outlined
            dense
            placeholder="••••••••"
            :type="showPassword ? 'text' : 'password'"
          >
            <template #prepend>
              <q-icon name="lock" size="16px" color="grey-5" />
            </template>

            <!-- SHOW/HIDE LOZINKA -->
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

        <!-- POTVRDA LOZINKE -->
        <div class="col-6">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Ponovi</div>

          <q-input
            v-model="password2"
            outlined
            dense
            placeholder="••••••••"
            :type="showPassword2 ? 'text' : 'password'"
          >
            <template #prepend>
              <q-icon name="lock" size="16px" color="grey-5" />
            </template>

            <!-- SHOW/HIDE POTVRDE -->
            <template #append>
              <q-icon
                :name="showPassword2 ? 'visibility_off' : 'visibility'"
                size="16px"
                color="grey-5"
                class="cursor-pointer"
                @click="showPassword2 = !showPassword2"
              />
            </template>
          </q-input>
        </div>
      </div>

      <!-- DATUM ROĐENJA -->
      <div class="q-mb-md">
        <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">Datum rođenja</div>

        <q-input v-model="datumRodenja" outlined dense type="date">
          <template #prepend>
            <q-icon name="calendar_today" size="16px" color="grey-5" />
          </template>
        </q-input>
      </div>

      <!-- SPOL ODABIR -->
      <div class="q-mb-lg">

        <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">
          Spol
        </div>

        <div class="row q-col-gutter-sm">

          <!-- MUŠKI -->
          <div class="col-6">
            <q-card
              flat bordered
              :class="spol === 'muski' ? 'bg-deep-purple-1' : ''"
              :style="spol === 'muski' ? 'border-color: #534AB7;' : ''"
              style="border-radius: 8px; cursor: pointer;"
              @click="spol = 'muski'"
            >
              <q-card-section class="q-pa-sm row items-center no-wrap" style="gap: 8px;">
                <q-radio v-model="spol" val="muski" color="deep-purple" dense />
                <span class="text-body2">Muški</span>
              </q-card-section>
            </q-card>
          </div>

          <!-- ŽENSKI -->
          <div class="col-6">
            <q-card
              flat bordered
              :class="spol === 'zenski' ? 'bg-deep-purple-1' : ''"
              :style="spol === 'zenski' ? 'border-color: #534AB7;' : ''"
              style="border-radius: 8px; cursor: pointer;"
              @click="spol = 'zenski'"
            >
              <q-card-section class="q-pa-sm row items-center no-wrap" style="gap: 8px;">
                <q-radio v-model="spol" val="zenski" color="deep-purple" dense />
                <span class="text-body2">Ženski</span>
              </q-card-section>
            </q-card>
          </div>

        </div>
      </div>

      <!-- REGISTRACIJA BUTTON -->
      <q-btn
        unelevated color="deep-purple"
        label="Registriraj se"
        icon="how_to_reg"
        class="full-width"
        style="border-radius: 8px; font-weight: 500;"
        @click="register"
      />

      <!-- ERROR PORUKA -->
      <div v-if="message" class="text-red text-caption text-center q-mt-md">
        <q-icon name="error_outline" size="14px" /> {{ message }}
      </div>

      <q-separator class="q-my-md" />

      <!-- LINK NA LOGIN -->
      <div class="text-center text-caption text-grey-6">
        Već imate račun?
        <router-link
          to="/login"
          class="text-deep-purple-8"
          style="text-decoration:none; font-weight:500;"
        >
          Prijavite se
        </router-link>
      </div>

    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {

    // ROUTER ZA REDIRECT NAKON REGISTRACIJE
    const router = useRouter()

    // FORM STATE
    const ime = ref('')
    const prezime = ref('')
    const email = ref('')
    const password = ref('')
    const password2 = ref('')
    const spol = ref('')
    const datumRodenja = ref('')
    const message = ref('')

    // SHOW/HIDE LOZINKE
    const showPassword = ref(false)
    const showPassword2 = ref(false)

    // REGISTRACIJA FUNKCIJA
    const register = () => {

      // VALIDACIJA OBAVEZNIH POLJA
      if (!ime.value || !prezime.value || !email.value ||
          !password.value || !password2.value ||
          !spol.value || !datumRodenja.value) {
        message.value = "Sva polja su obavezna"
        return
      }

      // PROVJERA LOZINKI
      if (password.value !== password2.value) {
        message.value = "Lozinke se ne podudaraju"
        return
      }

      // API ZA REGISTRACIJU
      fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: ime.value,
          prezime: prezime.value,
          email: email.value,
          password: password.value,
          spol: spol.value,
          datumRodenja: datumRodenja.value
        })
      })
        .then(res => res.json())
        .then(data => {

          // BACKEND ERROR
          if (data.error) {
            message.value = data.error
            return
          }

          // SUCCESS → LOGIN PAGE
          router.push('/login')
        })
        .catch(() => {
          message.value = "Greška na serveru"
        })
    }

    return {
      ime,
      prezime,
      email,
      password,
      password2,
      spol,
      datumRodenja,
      message,
      showPassword,
      showPassword2,
      register
    }
  }
}
</script>

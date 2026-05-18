<template>
  <div class="q-pa-md flex flex-center" style="min-height:100vh;">
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">
      <div class="text-h5 text-center q-mb-md">Registracija</div>

      <q-input filled v-model="ime" label="Ime" class="q-mb-md"/>
      <q-input filled v-model="prezime" label="Prezime" class="q-mb-md"/>
      <q-input filled v-model="email" label="Email" class="q-mb-md"/>
      <q-input filled v-model="password" label="Lozinka" type="password" class="q-mb-md"/>
      <q-input filled v-model="password2" label="Ponovi lozinku" type="password" class="q-mb-md"/>

      <q-input
        filled
        v-model="datumRodenja"
        label="Datum rođenja"
        type="date"
        class="q-mb-md"
      />

      <q-option-group
        v-model="spol"
        :options="[
          { label: 'Muški', value: 'muski' },
          { label: 'Ženski', value: 'zenski' }
        ]"
        type="radio"
        inline
        class="q-mb-md"
      />

      <q-btn
        color="primary"
        label="Registriraj se"
        class="full-width q-mt-sm"
        @click="register"
      />

      <div v-if="message" class="text-red q-mt-md text-center">
        {{ message }}
      </div>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const ime = ref('')
    const prezime = ref('')
    const email = ref('')
    const password = ref('')
    const password2 = ref('')
    const spol = ref('')
    const datumRodenja = ref('')
    const message = ref('')

    const register = () => {
      if (
        !ime.value ||
        !prezime.value ||
        !email.value ||
        !password.value ||
        !password2.value ||
        !spol.value ||
        !datumRodenja.value
      ) {
        message.value = "Sva polja su obavezna"
        return
      }

      if (password.value !== password2.value) {
        message.value = "Lozinke se ne podudaraju"
        return
      }

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
          if (data.error) {
            message.value = data.error
            return
          }

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
      register
    }
  }
}
</script>
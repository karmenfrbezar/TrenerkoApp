<template>
  <div class="q-pa-md flex flex-center" style="min-height:100vh;">
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">
      <div class="text-h5 text-center q-mb-md">Prijava</div>

      <q-input filled v-model="email" label="Email" class="q-mb-md" />
      <q-input filled v-model="password" label="Lozinka" type="password" class="q-mb-md" />

      <q-btn color="primary" label="Prijavi se" class="full-width q-mt-sm" @click="login" />

      <div v-if="message" class="text-red q-mt-md text-center">
        {{ message }}
      </div>
    </q-card>
  </div>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const mainUser = inject('user')
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const message = ref('')

    const login = () => {
      if (!email.value || !password.value) {
        message.value = "Sva polja su obavezna"
        return
      }

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
          console.log("LOGIN DATA:", data)

          if (data.error) {
            message.value = data.error
            return
          }

          mainUser.value = {
            id: data.id,
            email: data.email,
            ime: data.ime,
            prezime: data.prezime,
            spol: data.spol,
            role: data.role,
            status: data.status
          }

          router.push('/')
        })
        .catch(() => {
          message.value = "Greška prilikom prijave"
        })
    }

    return { email, password, message, login }
  }
}
</script>
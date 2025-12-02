<template>
  <div class="q-pa-md flex flex-center" style="min-height:100vh;">
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">
      <div class="text-h5 text-center q-mb-md">Registracija</div>

      <q-input filled v-model="username" label="Korisničko ime" class="q-mb-md"/>
      <q-input filled v-model="email" label="Email" class="q-mb-md"/>
      <q-input filled v-model="password" label="Lozinka" type="password" class="q-mb-md"/>
      <q-input filled v-model="password2" label="Ponovi lozinku" type="password" class="q-mb-md"/>

      <!-- Polje za spol -->
      <q-option-group
        v-model="gender"
        :options="[
          { label:'Muško', value:'muško' },
          { label:'Žensko', value:'žensko' }
        ]"
        type="radio"
        inline
        label="Spol"
        class="q-mb-md"
      />

      <q-btn color="primary" label="Registriraj se" class="full-width q-mt-sm" @click="register"/>
      <div v-if="message" class="text-red q-mt-md text-center">{{ message }}</div>
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

    const username = ref('')
    const email = ref('')
    const password = ref('')
    const password2 = ref('')
    const gender = ref('')
    const message = ref('')

    const register = () => {
      if(!username.value || !email.value || !password.value || !password2.value || !gender.value){
        message.value = "Sva polja su obavezna"
        return
      }

      if(password.value !== password2.value){
        message.value = "Lozinke se ne podudaraju"
        return
      }

      fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
          gender: gender.value
        })
      })
      .then(res => res.json())
      .then(data => {
        mainUser.value = { id:data.id, username:username.value, email:email.value, gender:gender.value }
        router.push('/')
      })
      .catch(() => { message.value = "Greška prilikom registracije" })
    }

    return { username, email, password, password2, gender, message, register }
  }
}
</script>

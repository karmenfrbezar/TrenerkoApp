<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Trenerko</q-toolbar-title>

        <!-- Navigacija -->
        <q-btn flat label="Početna" to="/" />
        <q-btn flat label="Sportski objekti" to="/mapa" />
        <q-btn flat label="Pretraživanje" to="/pretraga" />
        <q-btn flat label="Rezervacije" to="/rezervacije" />
        <q-btn flat label="Recenzije" to="/recenzije" />
        <q-btn flat label="Dodaj objekte" to="/unos-objekata" />

        <q-space />

        <!-- Login/Registracija ili Username + Logout -->
        <template v-if="!currentUser">
  <q-btn flat label="Login" to="/login" class="bg-orange text-white" />
  <q-btn flat label="Registracija" to="/registracija" />
</template>

        <template v-else>
          <q-btn flat :label="currentUser.username" to="/profil"/>
          <q-btn flat label="Logout" @click="logout" class="bg-red text-white"/>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const currentUser = ref(null)
    provide('user', currentUser)

    const logout = () => {
      currentUser.value = null
      router.push('/')
    }

    return { currentUser, logout }
  }
}
</script>

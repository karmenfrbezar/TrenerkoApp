<template>
  <q-layout view="lHh Lpr lFf">

 
    <q-header elevated class="header">
      <q-toolbar>

        <q-toolbar-title class="logo">
          Trenerko
        </q-toolbar-title>

       
        <div class="nav">
          <q-btn flat label="Početna" to="/" />
          <q-btn flat label="Objekti" to="/mapa" />
          <q-btn flat label="Pretraga" to="/pretraga" />
          <q-btn flat label="Recenzije" to="/recenzije" />

          <q-btn
            v-if="isOwnerOrAdmin"
            flat
            label="Dodaj"
            to="/unosobjekata"
          />

          <q-btn
            v-if="isAdmin"
            color="orange"
            icon="shield"
            label="Admin"
            to="/admin"
          />
        </div>

        <q-space />

        
        <div class="auth">
          <template v-if="!currentUser">
            <q-btn flat label="Login" to="/login" />
            <q-btn unelevated color="orange" label="Registracija" to="/registracija" />
          </template>

          <template v-else>
            <q-btn flat icon="person" :label="userName" to="/profil" />
            <q-btn flat icon="logout" color="red" @click="logout" />
          </template>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, computed, provide } from 'vue'
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

    const role = computed(() => currentUser.value?.role?.trim())

    const isAdmin = computed(() => role.value === 'Admin')

    const isOwnerOrAdmin = computed(() =>
      ['Admin', 'Vlasnik objekta'].includes(role.value)
    )

    const userName = computed(() =>
      currentUser.value ? `${currentUser.value.ime}` : ''
    )

    return {
      currentUser,
      logout,
      isAdmin,
      isOwnerOrAdmin,
      userName
    }
  }
}
</script>

<style scoped>
.header {
  background: #272729ec;
}

.logo {
  font-weight: 700;
  color: #308deb;
  letter-spacing: 1px;
}


.nav {
  display: flex;
  gap: 4px;
}


.auth {
  display: flex;
  gap: 6px;
  align-items: center;
}


.q-btn {
  border-radius: 8px;
}
</style>
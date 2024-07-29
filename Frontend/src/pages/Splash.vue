<template>
  <div class="flex justify-center items-center min-h-screen p-4">
    <div
      class="flex flex-col md:grid grid-cols-2 justify-center items-center md:space-x-5 max-w-4xl w-full"
    >
      <div class="mb-4 md:mb-0">
        <img src="../images/splash3.jpg" class="w-full" />
      </div>
      <div class="flex flex-col space-y-5 text-center md:text-left">
        <div class="flex flex-col space-y-5">
          <h1
            class="text-3xl md:text-4xl px-2 text-left font-semibold text-slate-800"
          >
            Welcome to our TownService App
          </h1>
          <p class="text-slate-600 hidden md:block">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam
            perferendis ipsa quidem sapiente quam nulla rem ducimus similique,
            ipsum dicta doloribus quibusdam explicabo quaerat nisi iusto
            deserunt unde ad vel.
          </p>
          <h2 class="font-semibold text-slate-700 text-left px-2">
            Powered by NBT-HUB
          </h2>
        </div>
        <div>
          <router-link to="/register">
            <button class="button">Register Now</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
/* Add your styles here */
</style>

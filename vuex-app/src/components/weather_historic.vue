<template>
  <div class="sliderItem" style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; background-color: white; border-radius: 15px" >
    <p class="text">{{day}}</p>
    <img style="height: 50%; width: 80%; object-fit: contain" :src=image>
    <p class="text"> {{ maxTemp }} <span class="lightText">{{minTemp}}</span></p>
  </div>
</template>

<script>
export default {
  name: "weather_prediction",
  props: ['day', 'image', 'minTemp', 'maxTemp'],
}
</script>

<style scoped>

</style>

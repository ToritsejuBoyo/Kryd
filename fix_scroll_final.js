const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx')) results.push(file);
  });
  return results;
};

const files = walk(path.join(__dirname, 'app', '(auth)', 'onboarding'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Skip experience.tsx since I already manually modified it
  if (f.endsWith('experience.tsx')) return;

  // We want to change:
  // <Animated.View entering={...} exiting={...} style={{ flex: 1 }}>
  //   <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
  //     <View className="max-w-xl w-full mx-auto flex-grow">
  //
  // To:
  // <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
  //   <Animated.View entering={...} exiting={...} className="max-w-xl w-full mx-auto flex-grow">

  const regexTop = /<Animated\.View(.*?)style=\{\{ flex: 1 \}\}>\s*<ScrollView className="flex-1" (.*?)>\s*<View className="(.*?)"(.*?)>/g;
  content = content.replace(regexTop, '<ScrollView $2>\n        <Animated.View$1className="$3"$4>');

  // Some files might have different formatting, let's also support the original format just in case
  const regexTopOriginal = /<Animated\.View(.*?)className="flex-1">\s*<ScrollView contentContainerStyle=\{(.*?)\} showsVerticalScrollIndicator=\{false\}>\s*<View className="(.*?)"(.*?)>/g;
  content = content.replace(regexTopOriginal, '<ScrollView contentContainerStyle={$2} showsVerticalScrollIndicator={false}>\n        <Animated.View$1className="$3"$4>');

  // Bottom replacement:
  // </View>
  // </ScrollView>
  // </Animated.View>
  // To:
  // </Animated.View>
  // </ScrollView>
  content = content.replace(/<\/View>\s*<\/ScrollView>\s*<\/Animated\.View>/g, '</Animated.View>\n      </ScrollView>');

  fs.writeFileSync(f, content);
});

console.log('Swapped Animated.View and ScrollView in all onboarding screens');

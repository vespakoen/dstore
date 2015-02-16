# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<-SCRIPT
echo "Installing dependencies"
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs build-essential openjdk-7-jre

echo "Installing pm2"
npm install pm2

echo "Grab node-projector .deb"
wget https://github.com/trappsnl/node-projector/raw/master/build/debinstall/node-projector-1.deb

echo "Grab elasticsearch key"
wget -qO - https://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -

echo "Add elasticsearch repository"
sudo add-apt-repository -y "deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main"

echo "Running apt-get update"
sudo apt-get update

echo "Installing deb"
sudo dpkg -i node-projector-1.deb

echo "Running apt-get -f install"
sudo apt-get -f -y install

echo "Starting elasticsearch on boot"
sudo service elasticsearch start
sudo update-rc.d elasticsearch defaults 95 10

echo "Updating node-projector config"
sed -i "s/PROJECTOR_PATH=\/opt\/node-projector/PROJECTOR_PATH=\/vagrant/g" /etc/node-projector/node-projector.conf

echo "Start node-projector"
sudo service node-projector start
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.define 'node-projector' do |machine|
    machine.vm.box = "ubuntu/trusty64"
    machine.vm.hostname = "node-projector"
    machine.vm.box_url = 'https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box'

    machine.vm.network "private_network", ip: "192.168.33.123"

    machine.vm.provision :shell, inline: $script

    machine.vm.synced_folder "../node-projector/", "/vagrant", type: "nfs"

    machine.vm.provider "virtualbox" do |vb|
      vb.name = "node-projector"
      vb.customize ["modifyvm", :id, "--memory", "2048"]
    end
  end
end
